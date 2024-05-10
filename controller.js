import fs from "node:fs";

export const readFile = (callback) => {
    fs.readFile('./receitas.json', "utf-8", (err, data) => {
        if (err) {
            callback(err)
        }

        try {
            const receitas = JSON.parse(data)
            callback(null, receitas);
        }
        catch (error) {
            callback(error);
        };
    });
};

export const mudarDados = (receitas, novoFunc, callback) => {
    fs.writeFile("./receitas.json", JSON.stringify(receitas, null, 2), (err) => {
        if (err) {
            callback(err);
            return;
        };
        callback();
    });
};