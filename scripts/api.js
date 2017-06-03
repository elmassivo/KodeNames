function createSession(newBoardSeed, newBoardCardLayout){
    var createParams = {
        boardSeed : newBoardSeed,
        boardCardLayout : newBoardCardLayout
    };
    $.post('/api/Session/CreateSession', createParams)
    .done(function(response){
        if(response != null && response.success && response.data != null)
        {
            return response.data;
        }
        else
        {
            //TODO: throw an error here
            return false;
        }
    });
}

function performMove(sessionId, revealedCardList){
    var performParams = {
        sessionId: sessionId,
        revealedCards: revealedCardList
    };
    $.post('/api/Session/PerformMove?sessionId='+sessionId, performParams)
    .done(function(response){
        return response;
    });
}

function getSession(sessionId){
    $.get('/api/Session/GetSession?sessionId='+sessionId)
    .done(function(response){
        return response;
    });
}