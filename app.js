require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const {createLogger, format, transports, transport} = require("winston");

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`
        })
    ),
    transport: [
        new transports.Console(),
        new transports.File({
            filename: "app.log"
        })
    ]
});

// set up MongoDB
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on("connected", () => {
    logger.info("Connected to MongoDB");
    
    const app = express();

    app.use(express.json());
    app.set("view engine", "ejs");

    const port = process.env.PORT || 5000;

    app.listen(port, (err) => {
        if (err) {
            logger.error(err.message);
            process.exit(0);
        }
        logger.info(`Server running at port ${port}.`);
    });
});

db.on("error", (err) => {
    logger.error("Failed to connect to MongoDB.", err);
    process.exit(0);
});

db.on("disconnected", () => {
    logger.error("Disconnected from MongoDB.");
})