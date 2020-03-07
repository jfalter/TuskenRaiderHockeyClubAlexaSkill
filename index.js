// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const axios = require("axios");
const cheerio = require("cheerio");

const officialTeamName = "Tusken Raiders";
const officialGameDay = "Sunday";

var d = new Date();
var month = d.getMonth() + 1;
var day = d.getDate();
var year = d.getFullYear();

const siteUrl = "http://inline.me/schedule.php?seasonSelect=&ds=" + year + "-" + month + "-" + day + "&de=&button=Show&command=showSchedule";

const fetchData = async () => {
  const result = await axios.get(siteUrl);
  return  cheerio.load(result.data);
};


const isDayOfWeek = function(payload) {
  var token = payload.split(",")[0];
  if(token && 
        (token == "Monday" || token == "Tuesday" || token == "Wednesday" || token == "Thursday" ||
         token == "Friday" || token == "Saturday" || token == "Sunday"))
    return true;
  return false;
};

const getResults = async () => 
{
  const $ = await fetchData();
  const allDays = $('td.schDateHeader');
  var gameDay;
  var gameDate; 
  var gameMonth;
  var gameDigits;
  var formattedGameDate;
  var gameTime;
  var startTime;
  var team1;
  var team2;
  var opponent;
  var results = [];
  var nGames = 0;
  allDays.each((i, el) => 
  {
      gameDay = $(el).text().trim().split(",")[0];
      
      if(gameDay == officialGameDay) //Check for Sundays
      {
        formattedGameDate = "default";
        gameDate = $(el).text().trim().split(",")[1];
        gameMonth = gameDate.substring(1,4);
        switch(gameDate.substring(1,4))
        {
            case "Jan":
                formattedGameDate = "January";
                break;
            case "Feb":
                formattedGameDate = "February";
                break;
            case "Mar": 
                formattedGameDate = "March";
                break;
            case 'Apr':
                formattedGameDate = "April";
                break;
            case 'May':
                formattedGameDate = "May";
                break;
            case 'Jun': 
                formattedGameDate = "June";
                break;
            case 'Jul':
                formattedGameDate = "July";
                break;
            case 'Aug':
                formattedGameDate = "August";
                break;
            case 'Sep':
                formattedGameDate = "September";
                break;
            case 'Oct':
                formattedGameDate = "October";
                break;
            case 'Nov':
                formattedGameDate = "November";
                break;
            case 'Dec':
                formattedGameDate = "December";
                break;
        }
        
        switch(gameDate.substring(5,7))
        {
            case '01':
                formattedGameDate += " first";
                break;
            case '02':
                formattedGameDate += " second";
                break;
            case '03':
                formattedGameDate += " third";
                break;
            case '04':
                formattedGameDate += " fourth";
                break;
            case '05':
                formattedGameDate += " fifth";
                break;
            case '06': 
                formattedGameDate += " sixth";
                break;
            case '07':
                formattedGameDate += " seventh";
                break;
            case '08':
                formattedGameDate += " eighth";
                break;
            case '09': 
                formattedGameDate += " ninth";
                break;
            case '10':
                formattedGameDate += " tenth";
                break;
            case '11':
                formattedGameDate += " eleventh";
                break;
            case '12':
                formattedGameDate += " twelvth";
                break;
            case '13': 
                formattedGameDate += " thirteenth";
                break;
            case '14':
                formattedGameDate += " fourteenth";
                break;
            case '15':
                formattedGameDate += " fifteenth";
                break;
            case '16':
                formattedGameDate += " sixteenth";
                break;
            case '17':
                formattedGameDate += " seventeenth";
                break;
            case '18':
                formattedGameDate += " eighteenth";
                break;
            case '19':
                formattedGameDate += " nineteenth";
                break;
            case '20':
                formattedGameDate += " twentieth";
                break;
            case '21':
                formattedGameDate += " twenty first";
                break;
            case '22':
                formattedGameDate += " twenty second";
                break;
            case '23':
                formattedGameDate += " twenty third";
                break;
            case '24':
                formattedGameDate += " twenty fourth";
                break;
            case '25':
                formattedGameDate += " twenty fifth";
                break;
            case '26':
                formattedGameDate += " twenty sixth";
                break;
            case '27':
                formattedGameDate += " twenty seventh";
                break;
            case '28':
                formattedGameDate += " twenty eighth";
                break;
            case '29':
                formattedGameDate += " twenty ninth";
                break;
            case '30':
                formattedGameDate += " thirtieth";
                break;
            case '31': 
                formattedGameDate += " thirty first";
                break;
        }
        
        
        var found = false;
        var nextDay = false;
        el = $(el).parent().next();
      
        while(el && !found && !nextDay)
        {
          if(isDayOfWeek(el.text().trim()))
          {
            nextDay = true;
          }
          else
          {
            if($(el).text().indexOf(officialTeamName) > -1)
            {
              $(el).children().each(function(index, element) 
              {
                //0 has game time, 2 has team 1, 4 has team 2
                switch(index)
                {
                  case 0: 
                    gameTime = $(this).text().trim();
                    break;
                  case 2:
                    team1 = $(this).text().trim();
                    break;
                  case 4: 
                    team2 = $(this).text().trim();
                    break;

                }
              });
              if(team1 == officialTeamName)
                opponent = team2; 
              else
                opponent = team1;
            
              startTime = gameTime.split(" ")[0];
              found = true;

              results[nGames++] = {
                opponent: opponent,
                date: formattedGameDate,
                time: startTime
              };
            }
          }
          
          el = $(el).next();
        }

      }
  });
  //console.log(results);
  return results;
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, you can say Next Game or Full Schedule. Which would you like to try?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const NextGameIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NextGameIntent';
    },
    async handle(handlerInput) {
        
            const results = await getResults();
            
            const speakOutput = "The next " + officialTeamName + " game is at " + results[0].time + " on " + results[0].date + " against " + results[0].opponent;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
};
const FullScheduleIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FullScheduleIntent';
    },
    async handle(handlerInput) {
        const results = await getResults();
            
        var speakOutput = "Here is the full " + officialTeamName + " schedule.  ";
        for(var i = 0; i < results.length; i++)
        {
            speakOutput += results[i].date + " at " + results[i].time + " against " + results[i].opponent + ".  ";  
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        NextGameIntentHandler,
        FullScheduleIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
