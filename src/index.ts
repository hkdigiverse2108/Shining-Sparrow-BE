"use strict"
/**
 * @author Pramit Mangukiya
 * @description Server and REST API config
 */
import * as bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import cors from 'cors'
import { mongooseConnection } from './database'
import * as packageInfo from '../package.json'
import { router } from './Routes'
import path from "path"
import multer from "multer"
import fs from "fs"
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { userModel } from './database'
import { config } from '../config';

const ObjectId = require('mongoose').Types.ObjectId;

const app = express();
app.use(cors());
app.use("/images", express.static(path.join(__dirname, "..", "..", "images")));
app.use("/pdf", express.static(path.join(__dirname, "..", "..", "pdf")));
app.use("/docs", express.static(path.join(__dirname, "..", "..", "docs")));

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), "images");

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        const sanitizedOriginalName = file.originalname.replace(/\s+/g, "-");
        cb(null, `${Date.now()}_${sanitizedOriginalName}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


app.use(mongooseConnection);
app.use(multer({ storage: fileStorage, fileFilter }).fields([{ name: "images", maxCount: 100 }, { name: 'pdf', maxCount: 100 }, { name: 'doc', maxCount: 100 }]));
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const health = (req, res) => {
    return res.status(200).json({
        message: `Project Name Server is Running, Server health is green`,
        app: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,
        author: packageInfo.author,
        license: packageInfo.license
    })
}
const bad_gateway = (req, res) => { return res.status(404).json({ status: 404, message: "Project Name Backend API Route Not Found" }) }

app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => {
    res.send('Server is running ');
});
app.use(router)
app.use('*', bad_gateway);

let server = new http.Server(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Make io accessible to controllers
app.set('io', io);

io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token;
    let userId = null;
    let userRole = null;

    // Authenticate user from JWT
    if (token) {
        try {
            let actualToken = token;
            if (typeof token === 'string' && token.startsWith("Bearer ")) {
                actualToken = token.split(" ")[1];
            }
            const decoded = jwt.verify(actualToken, config.JWT_TOKEN_SECRET || process.env.JWT_TOKEN_SECRET);
            const user = await userModel.findOne({ _id: new ObjectId(decoded._id), isDeleted: false }).lean();
            if (user) {
                userId = user._id.toString();
                userRole = user.role;
                // Join personal room by userId
                socket.join(userId);
                if (userRole === 'admin') {
                    socket.join('admins');
                }
                console.log(`Socket authenticated user: ${user.fullName} (${userRole})`);
            }
        } catch (err) {
            console.log('Socket auth failed:', err.message);
        }
    }

    // Everyone joins global room
    socket.join('global');

    // Join user's personal chat rooms
    if (userId) {
        const { chatRoomModel } = require('./database');
        const query: any = { type: 'personal', isDeleted: false };
        if (userRole !== 'admin') {
            query.participants = new ObjectId(userId);
        }
        const personalRooms = await chatRoomModel.find(query).lean();
        personalRooms.forEach(room => socket.join(room._id.toString()));
    }

    socket.on('disconnect', () => {
        // Cleanup if needed
    });
});

export default server;

