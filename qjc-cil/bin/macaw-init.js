#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const shell = require('shelljs')
const ora = require('ora')
const { logger } = require('../lib')
const inquirer = require('inquirer')
const chalk = require('chalk')

program.usage('<project-name>')

//根据输入，获取项目名称
let projectName = process.argv[2];
if(!projectName){
  program.help();
  return
}

const list = glob.sync('*');
let next = undefined;

let rootName = path.basename(process.cwd())
if(list.length){
  if(list.some(n => {
    const fileName = path.resolve(process.cwd(),n)
    const isDir = fs.statSync(fileName).isDirectory();
    return projectName === n && isDir
  })){
    console.log(`项目${projectName}已经存在`);
    // remove(path.resolve(process.cwd(), projectName))
    return
  }

 next = Promise.resolve(projectName);

}else if (rootName === projectName) {
  rootName = '.';
  next = inquirer.prompt([
    {
      name: 'buildInCurrent',
      message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
      type: 'confirm',
      default: true
    }
  ]).then(answer => {
    return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
  })
} else {

  next = Promise.resolve(projectName)
}

next && go()
function go () {
  const question = [{
    type: 'input',
    name: 'projectName',
    message: `请输入项目名称：（默认【${projectName}】）`,
    default: projectName
  }]
  inquirer
    .prompt(question)
    .then(answer => {
      const { projectName } = answer
      const spinner = ora('clone template...')
      spinner.start()
      shell.exec(`git clone https://github.com/bobleelineqiu/node.git ${projectName}`, { silent: false }, (code, error) => {
        spinner.stop()
        if (code !== 0) throw new Error('拷贝模板出错')
        shell.cd(projectName)
        shell.rm('-rf', '.git')
        shell.rm('-rf', '.gitignore')
        logger.log(`项目创建成功能`)
        logger.log(`cd ${projectName}`)
        logger.log(`npm install`)
        shell.exit(1);
      })

    })
}
