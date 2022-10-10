// https://sequelize.org/docs/v6/getting-started/

const { Sequelize, Model, DataTypes } = require("sequelize");
// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('arq_sw_mysql', 'root', 'root', 
    {
    host: 'localhost',
    /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
    dialect: 'mysql'
    }
);

async function conectar(){
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        const User = sequelize.define("user", {
            nombre: {
                // https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types
                type: DataTypes.STRING(50),
                get() {
                    const rawValue = this.getDataValue('nombre');
                    return rawValue ? rawValue.toUpperCase() : null;
                },
                // validaciones built-in.
                validate: {
                    len: {
                        args: 3,
                        msg: "Nombre al menos 3 caracteres"
                    },
                    // validacion custom.
                    fn: (val) => {
                        if (val.indexOf('-') != -1) throw new Error("nombre no puede contenter caracter -");
                    }
                },
                //constraint
                allowNull: false,
            },
            apellido: DataTypes.STRING(50),
            email: {
                type: DataTypes.STRING(100),
                set(value) {
                    this.setDataValue('email', value.toLowerCase())
                },
                // validacion built-in.
                validate: {
                    isEmail:true
                },
                //constraint
                unique: true
            }   
        });

        const Log = sequelize.define("log", {
            log: {
                type: DataTypes.STRING(100),
            }
        });
        // https://sequelize.org/docs/v6/core-concepts/assocs/
        Log.belongsTo(User);
          
        (async () => {
            await sequelize.sync({ force: true });
            //crear instancia de modelo.
            try{
                const Usr = User.build({ nombre: "Ana", apellido: "Castillo", email:"ana@gmail.com"  });
                console.log(Usr.nombre);
                //create.
                await Usr.save();
                console.log(Usr.toJSON()); //idem a JSON.stringify.
                Usr.nombre = "Juan";
                //update.
                await Usr.save();
                console.log(Usr.toJSON());
                const Usr2 = await User.create({ nombre: "Pedro", apellido: "Perez", email:"pedro@gmail.com"  });
                console.log(Usr2.toJSON());
                
                await Log.create({ log: "login 1", userId:Usr2.id});
                await Log.create({ log: "login 2", userId:Usr2.id});

                //queries
                // https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
                // https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/
                const logs = await Log.findAll({ include: User });
                
                logs.forEach(log => {
                    console.log("logs =>",log.toJSON());
                });

                const log = await Log.findOne({ include: User });
                console.log("log =>",log.toJSON());
            }
            catch(e){
                console.log('Error =>', e.message);
            }
            
            //modelos.
            let users = await User.findAll();
            users.forEach(user => {
                console.log(user.toJSON());
            });

            users = await User.findAll({
                // case insensitive.
                where: {
                  nombre: "pedro"
                }
            });
            users.forEach(user => {
                console.log(user.toJSON());
            });
            
            // modelo
            const Usr3 = await User.findByPk(2);
            if (Usr3 === null) {
                console.log('Not found!');
            } else {
                console.log(Usr3.toJSON()); 
            }

            //legacy tables (creadas en ejemplo mysql)
            class Usuario extends Model {
                
            }
            Usuario.init({
                name: {
                    field: 'nombre',
                    type: DataTypes.STRING(50),
                    //validaciones...
                },
                apellido: {
                    field: 'apellido',
                    type: DataTypes.STRING(50)
                },
                email: {
                    field: 'email',
                    type: DataTypes.STRING(100),
                }
            }, 
                {
                sequelize,
                modelName: 'usuario',
                tableName: 'usuarios',}
            );
            const usuarios = await Usuario.findAll();
            usuarios.forEach(usuario => {
                console.log("usuario =>",usuario.toJSON());
            });
        })();
    } catch (error) {
        console.error('error');
    }
}

conectar();