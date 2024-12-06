import { AppManager } from "./appManager.js";
import { PostManager } from "./postManager.js";

export {
    SearchAndSuggestionsManager
};

class SearchAndSuggestionsManager{
    static userId;
    // static followList = [];
    static displayedUsers = [];
    static displayedAccounts = [];
    static page;
    static suggestionInterval;
    static cancelInterval;
    static resultPage;
    static userNameResult;
    static firstNameResult;
    static lastNameResult;
    static tagResult;
    static captionResult;

    static async start(){
        await this.getFollowSuggestion();

        $("#account_result").click( () => {
            this.resultPage =  'account';

            $(".results").html(`
                <div class="results_account">
                </div>
            `);
            this.displayedAccounts = [];
            this.showResults();

            $("#account_result").addClass("selected_nav_option");
            $("#tags_result").removeClass("selected_nav_option");
            $("#text_result").removeClass("selected_nav_option");
        });

        $("#tags_result").click( () => {
            this.resultPage =  'tag';
            $(".results").html(`
                <div class="results_tags">
                </div>
            `);
            this.showResults();
            $("#tags_result").addClass("selected_nav_option");
            $("#account_result").removeClass("selected_nav_option");
            $("#text_result").removeClass("selected_nav_option");
        });

        $("#text_result").click( () => {
            this.resultPage =  'text';
            $(".results").html(`
                <div class="results_text">
                </div>
            `);
            this.showResults();

            $("#text_result").addClass("selected_nav_option");
            $("#account_result").removeClass("selected_nav_option");
            $("#tags_result").removeClass("selected_nav_option");
        });


        if(this.suggestionInterval && this.cancelInterval){
            clearInterval(this.suggestionInterval);
            clearInterval(this.cancelInterval);
        }

        this.suggestionInterval = setInterval(this.getFollowSuggestion, 8000);
        this.cancelInterval = setInterval(this.ShouldCancelInterval, 1000);
    }

    static ShouldCancelInterval(){
        if (AppManager.currentPage != "feed"){
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

    static async getUserSearch(string){
        try{
            const response = await fetch( `/M00933241/users/search?idTag=${string}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });

            var result = await response.json();

            this.userNameResult = result.userByUsername;
            this.firstNameResult = result.userByFirstName;
            this.lastNameResult = result.userByLastName;

        }catch(err){
            console.log(`Issue getting user search for user \nError: ` + err);
        }
    }

    static async getContentSearch(string){
        try{
            const response = await fetch( `/M00933241/content/search?idTag=${string}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });

            var result = await response.json();
            this.captionResult = result.postByCaption;
            this.tagResult = result.postByTag;

        }catch(err){
            console.log(`Issue getting user search for tags and post\nError: ` + err);
        }
    }
    

    static showResults(){
        if(this.resultPage == "account"){
            for (var account of this.userNameResult){
                
                var displayedAccounts = this.displayedAccounts;

                var index = displayedAccounts.indexOf(account._id);

                if(index == -1){
                    this.displayedAccounts.push(account._id);
                    var accountString = this.constructAccount(account);
                    this.injectAccount(accountString,  account.authorId);

                }
                       
            }

            for (var account of this.firstNameResult){
                
                var displayedAccounts = this.displayedAccounts;

                var index = displayedAccounts.indexOf(account._id);

                if(index == -1){
                    this.displayedAccounts.push(account._id);
                    var accountString = this.constructAccount(account);
                    this.injectAccount(accountString,  account.authorId);
                }
                       
            }

            for (var account of this.lastNameResult){
                
                var displayedAccounts = this.displayedAccounts;

                var index = displayedAccounts.indexOf(account._id);

                if(index == -1){
                    this.displayedAccounts.push(account._id);
                    var accountString = this.constructAccount(account);
                    this.injectAccount(accountString,  account.authorId);
                }
                       
            }

        }else if(this.resultPage == "tag"){
            for (var postJSON of this.tagResult){

                var post = PostManager.constructPost(postJSON, true, this.userId);
                console.log(post);
                AppManager.injectPost(post, postJSON._id, "tag", postJSON.authorId);  
                
            }

        }else{
            for (var postJSON of this.captionResult){

                var post = PostManager.constructPost(postJSON, true, this.userId);
                AppManager.injectPost(post, postJSON._id, "caption", postJSON.authorId);
            }
        }
    }

    static constructAccount(accountInfo){
        var account = `
            <div class="search_follow_suggestion">
                <div class="search_follow_img_div">
                    <img src="${accountInfo.profile_img}" alt="profile image">
                </div>

                <div class="search_follow_suggestion_info">
                    <div class="search_follow_username">
                        <span><b>${accountInfo.userName}</b></span>
                    </div>
                    <div class="search_followstatus_post_info">
                        <div>
                            <div class="search_post_count">
                                <span>${accountInfo.post.length}</span>
                            </div>
                            <span><b>Post</b></span>
                        </div>
                        <div>
                            <div class="search_followstatus_count">
                                <span>${accountInfo.followers.length}</span>
                            </div>
                            <span><b>Followers</b></span>
                        </div>
                        <div>
                            <div class="search_followstatus_count">
                                <span >${accountInfo.following.length}</span>
                            </div>
                            <span><b>Following</b></span>
                        </div>
                    </div>
                </div>
                
            </div>
        
        `
        return account;

    }

    static injectAccount(accountString, accountId){
        $(".results_account").append(accountString);

        // this.displayedUsers.push(suggestion._id);
        // $(`#${suggestion._id}_suggested_friend_follow_button`).click( async () => {

        //     $(`#${suggestion._id}_suggested_friend`).remove();
        //     await AppManager.follow(suggestion._id);

        //     var indexOfSuggestion = SearchAndSuggestionsManager.displayedUsers.indexOf(suggestion._id);
        //     SearchAndSuggestionsManager.displayedUsers.splice(indexOfSuggestion, 1);

        //     AppManager.getAllPost();
        // });

        // $(`#${suggestion._id}_suggested_friend_username`).click( () => {
        //     alert(`Showing information of ${suggestion.userName}`);
        // });
    }

}

var resultsAccount = `
    <div class="results_account">
`
