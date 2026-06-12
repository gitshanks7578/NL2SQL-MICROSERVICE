import {prisma} from "../db/db.js"
import type {Request,Response,NextFunction} from "express"
import type { Authrequest } from "../middleware/verifyjwt.js"
// import { connect } from "node:http2"
import { testPostgresConnection,testMysqlConnection } from "../utils/connectionTest.js"
import { encrypt } from "../utils/encrypter.js"
import { ApiError } from "../utils/errorHandler.js"
import { runSchemaIngestion } from "../orchestration/schema_injestion/SI_orchestrator.js"

export const registerUser = async(req:Authrequest,res:Response,next:NextFunction)=>{
    try {
        const id = req.user?.userID
        if(!id){
            throw new ApiError("id is not defined in register user",400)
        }
        const existinguser =  await prisma.user.findUnique({
            where : {
                auth_id : req.user!.userID
            }
        })
        if(existinguser){
            throw new ApiError("user already exists", 400)
        }

        const user = await prisma.user.create({
            data:{
                auth_id : id
            }
        })
        return res.status(200).json({message:"user registered successfully",user , success:true})

    } catch (error) {
      // const message = error instanceof Error ? error.message : "unknown error hitted on register controller"
      //   return res.status(500).json({ message: `register controller error || ${message}` })   
      next(error)
    }
}


export const register_database_postgres = async(req:Authrequest,res:Response,next:NextFunction)=>{
    try {
        const { name, host, port, username, password, dbName} = req.body
        if(!name || !host || !username || !password || !dbName){
            throw new ApiError("incomplete/invalid credentials",400)
        }

        const user = await prisma.user.findUnique({
            where : {
                auth_id: req.user!.userID
            }
        })
     const userID = user!.id
     console.log(userID)
        
    const check = await testPostgresConnection({
        host,
        port: port ? Number(port) : 5432,
        username,
        password,
        dbName,
    })
    if(!check){
        throw new ApiError("connection failed || details rejected",400)
    }
       const db = await prisma.database.create({
      data: {
        name: name,
        type: "POSTGRES",
        host:host,
        port: port ? Number(port) : 5432,
        username: username,
        password: encrypt(password), // later: encrypt this
        dbName: dbName,
        user:{
        connect:{
            id : userID
        }
      }
      },
    });
    return res.status(201).json({
      message: "Postgres database registered successfully",
      database: db,
    });

    } catch (error) {
        next(error)
    }
}


export const register_database_mysql = async (req: Authrequest, res: Response,next:NextFunction) => {
  try {
    const { name, host, port, username, password, dbName } = req.body;

    if (!name || !host || !username || !password || !dbName) {
      throw new ApiError("incomplete / invalid details ",400)
    }

    const user = await prisma.user.findUnique({
      where: { auth_id: req.user!.userID },
    });

    const userID = user!.id;

    const check = await testMysqlConnection({
      host,
      port: port ? Number(port) : 3306,
      username,
      password,
      dbName,
    });

    if (!check) {
     throw new ApiError("Mysql connection failede || details rejected", 400)
    }

    const db = await prisma.database.create({
      data: {
        name,
        type: "MYSQL",
        host,
        port: port ? Number(port) : 3306,
        username,
        password : encrypt(password),
        dbName,
        user: {
          connect: { id: userID },
        },
      },
    });

    return res.status(201).json({
      message: "MySQL database registered successfully",
      database: db,
    });
  } catch (error) {
   next(error)
  }
};

export const schema_injestion = async (req:Authrequest,res:Response,next:NextFunction)=>{
  try {
    const {name} = req.body
    if(!name) throw new ApiError("give valid name for db for schema injestion",400)
    const existinguser =  await prisma.user.findUnique({
            where : {
                auth_id : req.user!.userID
            }
        })
        if(!existinguser){
          throw new ApiError("the accesstoken used to injest schema is invalid kindly register via valid accesstoken",400)
        }
    const db = await prisma.database.findUnique({
      where : {
        userid_name:{
          userid : existinguser.id,
          name : name
        }
      }
    })
    if(!db) throw new ApiError("db not found",404)
    
      const schemaIR = await runSchemaIngestion(db)
       const updated = await prisma.database.update({
      where: {
        id: db.id
      },
      data: {
        schemaIR,
        schemaUpdatedAt: new Date()
      }
    });
      return res.status(200).json({
      success: true,
      message: "schema ingestion successful",
      // dbId: updated.id,
      db : updated
    });


  } catch (error) {
    next(error)
  }
}

export const query = async(req:Authrequest,res:Response,next:NextFunction)=>{
  try {
    
  } catch (error) {
    next(error)
  }
}
//next