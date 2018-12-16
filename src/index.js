// Dependencies
const Logger = require("discord-blackhole.logger");
const Discord = require("discord.js");
const Express = require("express");
const IO = require("socket.io");
const Http = require("http");

// Logger Init
Logger.logs(Logger.form("logs/{year}{month}{date}{hour}{minute}{second}.log"));
Logger.replaceConsole();
Logger.setFormat("{year}/{month}/{date} {hour}:{minute}:{second}");

// Hello World
Logger.debug("Hello World");