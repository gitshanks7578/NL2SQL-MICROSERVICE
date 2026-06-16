import { verifyjwt } from "../middleware/verifyjwt.js";
import express from "express";
import { query, register_database_mysql, register_database_postgres, registerUser, schema_injestion } from "../controller/database.controller.js";
const database_router = express.Router()

database_router.post("/register-user",verifyjwt,registerUser)
database_router.post("/database-registeration-postgres",verifyjwt,register_database_postgres)
database_router.post("/database-registeration-mysql",verifyjwt,register_database_mysql)
database_router.post("/schema-injestion",verifyjwt,schema_injestion)
database_router.post("/query",verifyjwt,query)

export default database_router