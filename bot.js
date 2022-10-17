const pup = require('puppeteer');
//const cron = require('cron');
const { default: axios } = require('axios');
const userconfig = require ("./config")
const {username, password, streamer, Auth_token, gameName, ChromePath} = userconfig
const prompt = require('prompt-sync')({sigint: true})
const ua = require('user-agents');
let token_data;
let session_token;
var response_data;
var AppAuthCode;
const Stream_url = `https://twitch.tv/${streamer}`;
const userAgent = new ua();
const MainLoginButtonSelector = '#root > div > div.sc-AxiKw.idyRgi > nav > div > div.sc-AxiKw.dqvlir > div.sc-AxiKw.eRjZju > div > div.sc-AxiKw.jZMWtw.anon-user > div:nth-child(1) > button > div > div'
const UsernameSelector = '#login-username'
const PasswordSelector = '#password-input'
const AuthBodySelector = 'body > div.ReactModalPortal > div > div > div > div > div > div.sc-AxiKw.hqNDaa > div > div > div.sc-AxiKw.kNAaIn > div > div.sc-AxiKw.bewFyc > div > div.sc-AxiKw.fLrnFZ'
const AuthButtonSelector = 'body > div.ReactModalPortal > div > div > div > div > div > div.sc-AxiKw.hqNDaa > div > div > div.sc-AxiKw.kNAaIn > div > div.sc-AxiKw.fVuRyU > button > div > div'
const LoginButtonSelector = 'body > div.ReactModalPortal > div > div > div > div > div > div.sc-AxiKw.hqNDaa > div > div > div.sc-AxiKw.kNAaIn > form > div > div:nth-child(3) > button'




const params = new URLSearchParams()
params.append('client_id','...')
params.append('client_secret','...')
params.append('grant_type','client_credentials')

const revokeparams = new URLSearchParams()
revokeparams.append('client_id','y7y0leoc57bsk0r0d0pkl3r0s3akpj')
revokeparams.append('token', Auth_token)
const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'responseType' : 'json'
    }
}


async function PuppeteerSetup()
{


    pup.launch({executablePath: ChromePath ,headless: true, defaultViewport: null, args: ['--start-maximized']}).then(async browser => {
        const page = await browser.newPage()
        await page.setUserAgent(userAgent.toString())
        page.setDefaultTimeout(600000)
        await page.goto(Stream_url)
        await page.waitForNavigation();
        page.setDefaultNavigationTimeout(90000);
        console.log('Stream url: ' + page.url());
        page.waitForTimeout(3000)
        
        setInterval(() => {page.screenshot({path: `screenshot.png`}), 150000})   

     

        page.waitForTimeout(300000)
        await page.waitForSelector(MainLoginButtonSelector, 200)
        await page.click(MainLoginButtonSelector, 60)
        await page.waitForSelector(UsernameSelector, 100)
        await page.type(UsernameSelector, username, 120)
        await page.waitForSelector(PasswordSelector, 30)
        await page.type(PasswordSelector, password, 150)
        await page.waitForSelector(LoginButtonSelector, 20)
        await page.click(LoginButtonSelector, 10)
        await page.waitForTimeout(1500)
        if(page.waitForSelector(AuthBodySelector) != null)
        {            
            console.log('User Auth found!')
            setTimeout(() => AppAuthCodeInput(), 250)
            await page.waitForTimeout(1500)
            await page.waitForSelector(AuthBodySelector, 5000)
            await page.click(AuthBodySelector)
            await page.type(AuthBodySelector, AppAuthCode, 200)
            await page.click(AuthButtonSelector, 56)
        }else{
            console.log('User Auth not found!')
        }

        setTimeout(() => {

       
            setInterval(() => {

                if(page.waitForSelector('button.sc-fzozJi.sc-fznKkj.jwRWhW') != null)
                {
                    page.click('button.sc-fzozJi.sc-fznKkj.jwRWhW')
                    console.log('Points collected !')
                }


            },15000)




        }, 600000)

        process.on('exit', () => {browser.close();})

    })
    
    

        
       

    


    
}



function AppAuthCodeInput()
{

AppAuthCode = prompt('Input your app authorization code: ');
console.log('Proceeding... \n')

console.log('All done!\n')
return AppAuthCode;


}



async function GetToken() {
if(await axios.post('https://id.twitch.tv/oauth2/token', params, config
).then(async function (token) {
    token_data = await token.data;
    return token_data;
  }).catch(function (error)
  {
      console.log(error)
  }))
{
  console.log('Response received...')
}else{
    console.log('Error. No response from the server...')
}
   
};

async function CheckLive()
{
    console.log('Checking if the stream is up')
   await axios.get(`https://api.twitch.tv/helix/search/channels?query=${streamer}`, Liveconfig = {
       headers:
       {
        "client-id" : "y7y0leoc57bsk0r0d0pkl3r0s3akpj",
        "Authorization" : "Bearer " + session_token, 
        dataType: "json"
       }

   }
    ).then((response) => setTimeout(function (){response_data = response.data, 8000}) ).catch((err) => console.log(err))

   setTimeout(function (){
    for(var i in response_data.data)
     {
         console.log('Round: ' + i)
        if(response_data.data[i]['display_name'] == `${streamer}` && response_data.data[i]['is_live'] == true && response_data.data[i]['game_name'] == `${gameName}`){
            console.log('Found active stream on round: ' + i)
            console.log("Stream is up and running! Proceeding...")
            console.log('Name: ' + response_data.data[i]['display_name'])
            console.log('Game ' + response_data.data[i]['game_name'])
            console.log('Live: ' + response_data.data[i]['is_live'])


            //Whole setup goes here
            PuppeteerSetup();


            break;

        }else if(response_data.data[i]['display_name'] == null && response_data.data[i]['is_live'] == false && response_data.data[i]['game_name'] == null)
        {
            console.log('Streamer is not live!')
            console.log('Shutting down...')
            return 0;
        }
     }
   }, 12000)



}




function RevokeToken() {

    axios.post('https://id.twitch.tv/oauth2/revoke', revokeparams, config).then(() => {console.log('Token revoked!')}).catch(function (err){console.log(err)});
    


}


GetToken();
setTimeout(async function(){session_token = await token_data['access_token'];}, 2000);
setTimeout(function(){CheckLive();}, 6500)
process.on('exit', () => {RevokeToken()})

