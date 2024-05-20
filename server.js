import { createServer } from "node:http";
import { readFile, mudarDados } from "./controller.js";
import { URLSearchParams } from "node:url";
import uuid4 from "uuid4";

const PORT = 8080;

const server = createServer((req, res) => {
    const { method, url } = req;
    const writeHead = (status, message) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            "código": status,
            "retorno": message
        }));
        return;
    }

    readFile((err, receitas) => {
        if (err) {
           return writeHead(500, "Erro interno do servidor");
        }
        if (method === "GET" && url === "/receitas") {
            writeHead(200, receitas);
        } else if (method == "POST" && url == "/receitas") {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                const novaReceita = JSON.parse(body);
                if (!body) {
                    writeHead(400, "Corpo da solicitação está vazio");
                    return;
                };

                novaReceita.id = uuid4();
                novaReceita.order = receitas.length + 1;
                receitas.push(novaReceita);
                mudarDados(receitas, novaReceita, () => {
                    if (err) {
                        writeHead(500, "Erro interno do servidor")
                    }
                    writeHead(201, receitas)
                })
            });
        } else if (method == "PUT" && url.startsWith("/receitas/")) {
            const id = url.split("/")[2]
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                const updatedRecipe = JSON.parse(body);
                if (!body) {
                    writeHead(400, "Corpo da solicitação vazio");
                };
                const indexReceitas = receitas.findIndex((receita) => receita.id == id);
                if (indexReceitas == -1) {
                    writeHead(404, "Não foi encontrado nenhuma receita com este ID!");
                };
                receitas[indexReceitas] = { ...receitas[indexReceitas], ...updatedRecipe, id };
                mudarDados(receitas, receitas[indexReceitas], () => {
                    if (err) {
                        writeHead(500, "Erro interno do servidor");
                    };
                    writeHead(201, receitas[indexReceitas]);
                });
            });
        } else if (method == "DELETE" && url.startsWith("/receitas/")) {
            const id = parseInt(url.split('/')[2]);
            const index = receitas.findIndex(item => item.order == id);

            if (index == -1) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Não foi encontrado nenhuma receita com este ID!" }));
            };
            receitas.splice(index, 1);
            mudarDados(receitas, null, () => {
                if (err) {
                    writeHead(500, "Erro interno do servidor");
                };
                writeHead(201, "Apagado com sucesso");
            });
        } else if (method == "GET" && url.startsWith("/receitas/")) {
            console.log(`${method} e ${url}`)
        } else if (method == "GET" && url == "/categorias") {
            console.log(`${method} e ${url}`)
        } else if (method == "GET" && url.startsWith("/ingredientes/")) {
            const ingrediente = url.split('/')[2].toString();
            const receitaComIng = receitas.filter(receita => {
                return receita.ingredientes.filter(ing => ing.componente.includes(ingrediente))
            })
            console.log(receitaComIng)
            res.end()
            
        } else if (method === 'GET' && url.startsWith('/busca')) {
            const urlParam = new URLSearchParams(url.split("?")[1]);
            const termo = urlParam.get("termo")
            const resultadoBusca = receitas.filter(receita => receita.nome.includes(termo) || receita.categoria.includes(termo) ||
            receita.ingredientes.some(ingrediente => ingrediente.includes(termo)));
            if(resultadoBusca.length === 0){
                writeHead(404, "Não foi encontrada receita com este ingrediente");
            }
            writeHead(200, resultadoBusca);

        } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify("Não foi econtrada esta rota"))
        };
    });
}).listen(PORT, () => {
    console.log(`Server open in port ${PORT} 🚀`)
});