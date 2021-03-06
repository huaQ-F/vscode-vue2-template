const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

function generatePageName(dirName) {
    if (!dirName) {
        throw new Error('dir name should not be null');
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const nameArr = dirName.split('_');
    let className = '';
    
    for (const name of nameArr) {
        className += capitalizeFirstLetter(name);
    }
    
    return className;
}

function generatePage(componentName, fullPath, pageType) {
    if (fs.existsSync(fullPath)) {
        console.log(`${componentName} already exists, please choose another name.`);
        return;
    }

    const className = generatePageName(componentName);
    console.log(`class name: ${className}`);

    // create folder
    // fs.mkdirSync(fullPath);

    const vueTemplate = path.resolve(__dirname, './file_template/vue.txt');
    const htmlTemplate = path.resolve(__dirname, './file_template/html.txt');
    
    const jsTemplate = path.resolve(__dirname, './file_template/js.txt');
    const pythonTemplate = path.resolve(__dirname, './file_template/python.txt');
    // const sassTemplate = path.resolve(__dirname, './file_template/scss.scss');
    // const sassFile = path.resolve(`${fullPath}/index.scss`);
    // fs.writeFileSync(sassFile, fs.readFileSync(sassTemplate, { encoding: 'utf-8' }));

    let jsFile;
    let jsFileContent;
    let tempaltePath;
    let filePath;
    if (pageType === 'api') {
        tempaltePath = jsTemplate;
        filePath = `${fullPath}.js`;
        if(className.match(/\.py$/)){
            tempaltePath = pythonTemplate;
        }
    } else if (pageType === 'page') {
        tempaltePath = vueTemplate;
        filePath = `${fullPath}.vue`;
        if(className.match(/\.html$/)){
            tempaltePath = htmlTemplate;
        }
    }
    let replaceName = className;
    const arr = className.match(/(.*)((\.vue)|(\.html)|(\.js)|(\.py))$/);
    if(arr){
        filePath = `${fullPath}`;
        replaceName = arr[1]
    }
    jsFileContent = fs.readFileSync(tempaltePath, { encoding: 'utf-8' });
    jsFile = path.resolve(filePath);
    const str1 = replaceName.replace(/[\_\-]([A-Za-z])/g,(val1,val2) =>val2.toUpperCase())
    const str2 = str1.replace(/([A-Z])/g,'-'+"$1").toLocaleLowerCase().replace(/^\-/,'')
    let templateStr = jsFileContent.replace(/\<--ClassName--\>/g, str1.substring(0,1)+str1.substring(1))
    templateStr = templateStr.replace(/\<--className--\>/g, str2)

    fs.writeFileSync(jsFile, templateStr);

    exec(`cd ${fullPath} && git add .`, (err) => {
        if (err) {
            console.log('command fail:', 'git add .');
        } else {
            console.log('command success:', 'git add .');
        }
    });

   vscode.window.showInformationMessage('page created successfully!');
   vscode.workspace.openTextDocument(jsFile)
    .then(doc => {
        // ???VSCode????????????????????????????????????
        vscode.window.showTextDocument(doc);
    }, err => {
        console.log(`Open ${jsFile} error, ${err}.`);
    }).then(undefined, err => {
        console.log(`Open ${jsFile} error, ${err}.`);
    })
}

function activate(context) {
    console.log('Your extension "react-template" is now active!');

    const fc = vscode.commands.registerCommand('extension.createPage', function (param) {
        // The code you place here will be executed every time your command is executed

        // vscode.window.showInformationMessage(param.fsPath); 

        const folderPath = param.fsPath;

        const options = {
            prompt: "Please input the page name: ",
            placeHolder: "Page Name"
        }
        
        vscode.window.showInputBox(options).then(value => {
            if (!value) return;

            const pageName = value;
            const fullPath = `${folderPath}/${pageName}`;

            generatePage(pageName, fullPath, 'page');
        });
    });

    const pc = vscode.commands.registerCommand('extension.createApiPage', function (param) {
        const folderPath = param.fsPath;
        const options = {
            prompt: "Please input the component name: ",
            placeHolder: "Component Name"
        }
        
        vscode.window.showInputBox(options).then(value => {
            if (!value) return;

            const componentName = value;
            const fullPath = `${folderPath}/${componentName}`;

            generatePage(componentName, fullPath, 'api');
        });
    });

    context.subscriptions.push(fc);
    context.subscriptions.push(pc);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;