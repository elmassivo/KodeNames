function createSession(newBoardSeed, newBoardCardLayout){
    // TODO: use 'seed' and 'teams' to populate new board
    var createParams = {
        boardSeed : newBoardSeed,
        boardCardLayout : newBoardCardLayout
    };
    $.post('/api/Session/CreateSession', createParams)
    .done(function(response){
        if(response != null && response.success && response.data != null)
        {
            session = response.data.sessionId;
            location.hash = createHashString();
            $('#txtSessionId').val(session);
            updateBoardFromSession(response.data.sessionBoard);
            getSessionUpdateLoop();
        }
        else
        {
            //TODO: throw an error here
            return false;
        }
    })
    .fail(function(){
        //server kerfuffle error
    });;
}

function updateBoardFromSession(sessionBoard){
    $.each(sessionBoard.revealedCards, function(index,item){
        sessionClickTile(''+item);
    });
}

function performMove(sessionId, revealedCardList){
    // TODO: use $('.word.chosen') to pull list of revealed cards (in id field)
    var performParams = {
        sessionId: sessionId,
        revealedCards: revealedCardList
    };
    $.post('/api/Session/PerformMove', performParams)
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
    })
    .fail(function(){
        //server kerfuffle error
    });;
}

function getSession(sessionId){
    $.get('/api/Session/GetSession?sessionId='+sessionId)
    .done(function(response){
        if(response != null && response.success && response.data != null)
        {
            updateBoardFromSession(response.data.sessionBoard);
        }
        else
        {
            clearTimeout(getSessionLoop);
            //TODO: throw an error here
            return false;
        }
    })
    .fail(function(){
        clearTimeout(getSessionLoop);
        //server kerfuffle error
    });;
}