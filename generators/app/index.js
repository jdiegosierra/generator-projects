const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const shell = require('shelljs');
const { Octokit } = require('@octokit/core');
const octokit = new Octokit();


module.exports = class extends Generator {

  constructor(args, options) {
    super(args, options);
    this.project = {};
    this.sourceRoot(path.join(__dirname, '../templates'));
  }

  initializing() {
    shell.rm('-rf', this.templatePath());
    shell.mkdir(this.templatePath());
  }

  async prompting() {
    this.log(yosay(`Welcome to ${chalk.red('Diego')}'s project generator!`));

    const { data: projects } = await octokit.request('GET /users/{username}/repos', {
      headers: {
        accept: 'application/vnd.github.baptiste-preview+json',
      },
      username: 'jdiegosierra'
    });

    const templateProjects = projects.filter(project => {
      return project.is_template;
    });

    const projectTree = {};
    templateProjects.forEach(({ name, description, html_url: url }) => {
      const typeProject = description.split('/')[0];
      const titleProject = description.split('/')[1];
      if (!projectTree[typeProject]) projectTree[typeProject] = [];
      projectTree[typeProject].push({ title: titleProject, name, description, url });
    });

    const { typeProject } = await this.prompt([
      {
        message: 'Which type of project do you want to create?',
        type: 'list',
        name: 'typeProject',
        choices: Object.keys(projectTree)
      }
    ]);

    const { titleProject } = await this.prompt([
      {
        message: 'Choose a template project:',
        type: 'list',
        name: 'titleProject',
        choices: projectTree[typeProject].map(projectInfo => {
          return projectInfo.title;
        })
      }
    ]);

    this.project = projectTree[typeProject].find(project => project.title === titleProject);

    this.log('Loading project...');
    shell.cd(this.templatePath());
    shell.exec(`curl -L -O ${this.project.url}/archive/master.zip && unzip master.zip && rm master.zip`, { silent: true });
    this.project = { ...this.project, ...require(this.templatePath() + '/' + this.project.name + '-master/yeomanPrompts.js') };
    this.log("Project loaded! Let's customize your project.");

    if (this.project.prompting) await this.project.prompting.call(this);
  }

  async configuring() {
    if (this.project.configuring) await this.project.configuring.call(this);
  }

  async writing() {
    if (this.project.writing) await this.project.writing.call(this);
  }
};
