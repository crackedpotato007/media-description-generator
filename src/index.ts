import prompt from 'prompt-sync';
import {readdirSync, existsSync} from 'fs';
async function main() {
    const userInterface = prompt(); 
    const seriesName = userInterface('What is the name of the series?');
    const path = userInterface('What is the path of the series?');
    const season = userInterface('What is the season of the series?');
    const pack = userInterface('Is this a entire season or a single episode? -> Y/N');
    if(pack.toLowerCase() === 'y'){
        console.log('This is a entire season');
    }
    else if(pack.toLowerCase() === 'n'){
        console.log('This is a single episode');
    }
    else{
        return console.log('Invalid input');
    }
    console.log('Series Name:', seriesName);
    console.log('Path:', path);
    console.log('Season:', season);
    console.log('Pack:', pack);
    const pathExists = existsSync(path);
    if(!pathExists){
        return console.log('Invalid path');
    }
    
    const files = readdirSync(path);
    console.log(files);
}
main()