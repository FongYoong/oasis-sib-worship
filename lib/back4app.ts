import Parse from 'parse/node'

Parse.initialize(process.env.BACK4APP_APP_ID, process.env.BACK4APP_JS_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/'

export { Parse };