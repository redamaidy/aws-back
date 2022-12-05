# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

# Poryecto hecho con AWS-CDK

el archivo donde se genera la pila de cloud formation se encuentra en ./lib/back-stack.ts

para generar un archivo .yml apartir de este codigo se usa el comando:
* `cdk synth`
para hacer un deploy de la pila en cloud formation se usa
* `cdk deploy` 


# Proyecto

El proyecto consta de una API que se conecta con dynamodb para la creación y consulta de usuarios.
el proyecto se encuentra en la carpeta src/ y el archivo principal es app.js