const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const authenticatedUser = require('./router/auth_users.js').authenticatedUser;
const genl_routes = require('./router/general.js').general;

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
