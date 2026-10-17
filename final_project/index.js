const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

let users = []
//  Verifica se um usuário existe em users array
const doesExist = (username) => {
    // Procura no array de usuários um usuário com o mesmo nome de usuário fornecido
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Retorna true se houver um usuário com o mesmo nome de usuário, caso contrário, retorna false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}
// Verifica se o usuário e a senha correspondem a um usuário existente
const authenticatedUser = (username, password) => {
    // Procura no array de usuários um usuário com o mesmo nome de usuário e senha fornecidos
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Retorna true se houver um usuário válido, caso contrário, retorna false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Request nos campos do body
    const { username, password } = req.body;
    // Verifica se os campos foram informados
    if (!username || !password) {
        // Retorna erro
        return res.status(404).json({ message: "Error logging in" });
    }
    // Verifica se o usuário e a senha correspondem a um usuário existente
    if (authenticatedUser(username, password)) {
        // Gera o JWT access token, com duração de 1 hora, usando a senha como payload
        let accessToken = jwt.sign({ data: password}, 'access', { expiresIn: 60 * 60 });
        // Cria a sessão do usuário com o token de acesso e o nome de usuário
        req.session.authorization = { accessToken, username}
        //  Retorna uma resposta de sucesso com o status 200 e uma mensagem de login bem-sucedido
        return res.status(200).send("User successfully logged in");
    } else {
        // Retorna uma resposta de erro com o status 208 e uma mensagem de login inválido
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
