const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const shell = require('shelljs');
const templatePath = path.join(__dirname, '../templates')


module.exports = class extends Generator {
  initializing() {
    this.sourceRoot(templatePath);
  }

  async prompting() {
    this.log(
      yosay(
        `Welcome to ${chalk.red('Diego')}'s project generator!`
      )
    );

    const answers = await this.prompt([
      {
        message: 'Which type of project do you want to create?',
        type: 'list',
        name: 'kindProject',
        choices: [
          'API CRUD Lambda',
          'API Multiple Lambdas',
          'API Cluster App'
        ]
      }
    ]);

    if (answers.kindProject === 'API Multiple Lambdas') {
      await this.prompt([
        {
          message: 'Which language do you prefer?',
          type: 'list',
          name: 'projectLanguage',
          choices: [
            'JavaScript',
            'TypeScript',
            'Python'
          ]
        }
      ]);
    }
  }

  configuring() {
    shell.cd(templatePath)
    shell.exec('git clone https://github.com/jdiegosierra/aws-multiple-api-lambdas-template.git')
  }

  writing() {
    this.fs.copy(
      this.templatePath(templatePath + '/aws-multiple-api-lambdas-template'),
      this.destinationPath(),
      { globOptions: { dot: true } }
    );
  }
};
