
'use strict'

var net = require('net');
var Player = require('./player');
var fs = require('fs');
var crypto = require('crypto');
var World = require('./world/world');


class MinecraftServer {

    /**
     * Initializes a minecraft server
     * 
     */
    constructor() {
        this.TCPServer = net.createServer(this.onClientConnected.bind(this));
        this.OnlinePlayers = [];

        console.log("Loading config");

        this.Config = JSON.parse(fs.readFileSync(__dirname + "/../config.json").toString('utf-8'));
        if(!this.Config) console.error("Unable to find config file");

        console.log("Loading icon");

        this.Icon = Buffer.from(fs.readFileSync(__dirname + "/../" + this.Config["icon_file"])).toString('base64');
        if(!this.Icon) console.error("Unable to find icon file");

        console.log("Generating encryption KeyPair");

        this.EncryptionPassphrase = '';
        var { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 1024, 
            publicExponent: 65537,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
                cipher: 'aes-128-cfb8',
                passphrase: this.EncryptionPassphrase
            }
        });
        this.PublicKeyPEM = publicKey;
        this.PublicKeyDER = Buffer.from(this.PublicKeyPEM.substr(27, 219), 'base64'); // Convert PEM to DER
        this.PrivateKeyPEM = privateKey;
        this.EncryptionPadding = crypto.constants.RSA_PKCS1_PADDING;

        console.log("Loading world");

        this.World = new World(this.Config["world_file"]);

        // Old Test code
        /*
        var test = crypto.publicEncrypt({key: publicKey, padding: this.EncryptionPadding}, Buffer.from("test ok ok"));
        console.log(crypto.privateDecrypt({key: privateKey, padding: this.EncryptionPadding}, test).toString());
        */
    }

    /**
     * Get called whenever a client connects
     * 
     * @param {net.Socket} socket 
     */
    onClientConnected(socket) {
        var player = new Player(socket, this);
    }

    /**
     * Gets called whenever a player connects
     * 
     * @param {Player} player 
     */
    onPlayerConnected(player) {
        this.OnlinePlayers.push(player);
    }

    /**
     * Gets called whenever a player disconnects
     * 
     * @param {Player} player 
     */
    onPlayerDisconnected(player) {
        this.OnlinePlayers.forEach((onlinePlayer, i) => {
            if(onlinePlayer === player) {
                this.OnlinePlayers.splice(i, 1);
            }
        });
    }

    /**
     * Lets the server listen on a specific port
     * 
     * @param {number} port 
     */
    listen(port) {
        this.TCPServer.listen(port);
        console.log("Server listening on port " + port);
    }



}

module.exports = MinecraftServer;