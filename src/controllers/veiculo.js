const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res) => {
    try {
        if (req.params.placa) {
            const veiculo = await prisma.veiculo.findUnique({
                where: { placa: req.params.placa },
                include: { estadias: true }
            });
            res.json(veiculo).end();
        }
        else {
            const veiculos = await prisma.veiculo.findMany();
            res.json(veiculos).end();
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar veiculos' });
    }
}

const create = async (req, res) => {
    // 1. Desestruturar os dados recebidos do corpo da requisição
    const { placa, tipo, proprietario, modelo, marca, cor, ano, telefone } = req.body;

    try {
        // 2. Criar um novo objeto de dados com os tipos corretos
        const veiculoData = {
            placa,
            tipo,
            proprietario,
            modelo,
            marca,
            cor,
            // AQUI ESTÁ A CORREÇÃO: Converter 'ano' para Inteiro
            // Se 'ano' não for enviado ou for inválido, ele se tornará 'null'
            ano: ano ? parseInt(ano) : null,
            telefone
        };

        // 3. Usar o novo objeto de dados tratados para criar o veículo
        const veiculo = await prisma.veiculo.create({
            data: veiculoData
        });

        res.status(201).json(veiculo).end();
    } catch (error) {
        // Adicionar um console.log para ver o erro detalhado no terminal do servidor
        console.error("ERRO AO CRIAR VEÍCULO:", error);
        res.status(400).json({ erro: 'Erro ao criar veiculo, verifique os dados enviados.', error: error.message }).end();
    }
}


const update = async (req, res) => {
    const { placa } = req.params;
    const { tipo, proprietario, modelo, marca, cor, ano, telefone } = req.body;

    try {
        const veiculoData = {
            tipo,
            proprietario,
            modelo,
            marca,
            cor,
            // Mesma correção aqui
            ano: ano ? parseInt(ano) : null,
            telefone
        };

        const veiculo = await prisma.veiculo.update({
            where: { placa: placa },
            data: veiculoData
        });
        res.status(202).json(veiculo);
    } catch (error) {
        console.error("ERRO AO ATUALIZAR VEÍCULO:", error);
        res.status(400).json({ erro: 'Erro ao atualizar veiculo', error: error.message });
    }
}


const del = async (req, res) => {
    const { placa } = req.params;
    try {
        await prisma.veiculo.delete({
            where: { placa: placa }
        });
        res.status(204).send();
    } catch (error) {
        //Se o veiculo não for encontrado retornar erro 404
        if (error.code === 'P2025') {
            return res.status(404).json({ erro: 'Veiculo não encontrado', error: error.message });
        } else {
            //Para outros erros, retornar erro 400
            res.status(400).json({ erro: 'Erro ao deletar veiculo', error: error.message });
        }
    }
}

module.exports = {
    read,
    create,
    update,
    del
};