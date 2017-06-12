function createSession(newBoardSeed, revealedCardIds){
    var createParams = {
        boardSeed : newBoardSeed,
        revealedCards : revealedCardIds
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
        alert("Could not create session, unable to connect to server.");
    });
}

function updateBoardFromSession(sessionBoard){
    if(seed !== sessionBoard.boardSeed){
        seed = sessionBoard.boardSeed;
        $('#seed').val(seed);
        location.hash = createHashString();
        fire();
    }
    $.each(sessionBoard.revealedCards, function(index,item){
        sessionClickTile(''+item);
    });
}

function performMove(sessionId, revealedCardList){
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
        alert("Could not perform move, lost connection to server.");   
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
    });;
}

function updateSeed(sessionId, newSeed){
    var updateParams = {
        sessionId: sessionId,
        newSeed: seed
    };
    $.post('/api/Session/UpdateSeed', updateParams)
    .done(function(response){
        if(response != null && response.success && response.data != null)
        {
            seed = '';
            updateBoardFromSession(response.data.sessionBoard);
            location.hash = createHashString();
        }
        else
        {
            //TODO: throw an error here
            return false;
        }
    })
    .fail(function(){
        alert("Could not update seed, lost connection to server.");
    });;

}