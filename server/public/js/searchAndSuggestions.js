import { AppManager } from "./appManager.js";

export {
    SearchAndSuggestionsManager
};

class SearchAndSuggestionsManager{
    static userId;
    // static followList = [];
    static displayedUsers = [];
    static page;
    static suggestionInterval;
    static cancelInterval;

    static async start(){
        await this.getFollowSuggestion();

        console.log(this.suggestionInterval, this.cancelInterval);
        if(this.suggestionInterval && this.cancelInterval){
            console.log("Cancelling interval, first if");
            clearInterval(this.suggestionInterval);
            clearInterval(this.cancelInterval);
        }

        this.suggestionInterval = setInterval(this.getFollowSuggestion, 8000);
        this.cancelInterval = setInterval(this.ShouldCancelInterval, 1000);

        console.log(this.suggestionInterval, this.cancelInterval);
    }

    static ShouldCancelInterval(){
        if (AppManager.currentPage != "feed"){
            console.log("Cancelling interval");
            SearchAndSuggestionsManager.displayedUsers = [];
            console.log(SearchAndSuggestionsManager.suggestionInterval, SearchAndSuggestionsManager.cancelInterval);
            clearInterval(SearchAndSuggestionsManager.suggestionInterval);
            clearInterval(SearchAndSuggestionsManager.cancelInterval);
        }
        
    }

    static async getFollowSuggestion(){
        try{

            const response = await fetch( `/M00933241/${SearchAndSuggestionsManager.userId}/suggestFollowing`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });
    
            var result = await response.json();
            var followList = result.followList;

            for(var suggestion of followList){
                var displayedUsers = SearchAndSuggestionsManager.displayedUsers;
                var index = displayedUsers.indexOf(suggestion._id);
                // console.log(index);
                if(index == -1){

                    var suggestedFriend = SearchAndSuggestionsManager.constructSuggestion(
                        suggestion._id,
                        suggestion.profile_img,
                        suggestion.userName
                    );

                    SearchAndSuggestionsManager.injectFollowSuggestions(suggestedFriend, suggestion);
                }
                
            }
            
        }catch(err){
            console.log("Issue getting follow suggestions \n Error: " + err)
        }
    }

    static constructSuggestion(id, profile_img, userName){
        var suggestedFriend = `
            <div class="suggested_friend_div" id="${id}_suggested_friend">
                <div class="suggested_friend_img_div">
                    <img src="${profile_img}" alt="profile picture">
                </div>
                <div class="suggested_friend_info">
                    <span class="suggested_friend_username"><b id="${id}_suggested_friend_username" >${userName}</b></span>
                </div>
                <div class="suggested_friend_follow">
                    <button class="suggested_friend_follow_button" id="${id}_suggested_friend_follow_button">Follow</button>
                </div>
            </div>
        `
        return suggestedFriend;
    }

    static injectFollowSuggestions(suggestedFriend, suggestion){
        $(".friend_suggestion").append(suggestedFriend);

        this.displayedUsers.push(suggestion._id);
        $(`#${suggestion._id}_suggested_friend_follow_button`).click( async () => {

            $(`#${suggestion._id}_suggested_friend`).remove();
            await AppManager.follow(suggestion._id);

            var indexOfSuggestion = SearchAndSuggestionsManager.displayedUsers.indexOf(suggestion._id);
            SearchAndSuggestionsManager.displayedUsers.splice(indexOfSuggestion, 1);

            AppManager.getAllPost();
        });

        $(`#${suggestion._id}_suggested_friend_username`).click( () => {
            alert(`Showing information of ${suggestion.userName}`);
        });
    }


}

