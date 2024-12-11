import { AppManager } from "./appManager.js";
import { PostManager } from "./postManager.js";

export {
    SearchAndSuggestionsManager
};

class SearchAndSuggestionsManager{
    static userId;
    static displayedUsers = [];
    static displayedAccounts = [];
    static displayedAccount;
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
        // Gets following suggestions
        await this.getFollowSuggestion();

        // Checks if an interval already exist
        if(this.suggestionInterval && this.cancelInterval){
            clearInterval(this.suggestionInterval);
            clearInterval(this.cancelInterval);
        }

        this.suggestionInterval = setInterval(this.getFollowSuggestion, 8000);
        this.cancelInterval = setInterval(this.ShouldCancelInterval, 1000);
    }

    static initializeNav(){
        // Detects when account tab is clicked
        $("#account_result").click( () => {
            // Sets result page to account
            this.resultPage =  'account';

            // Injects results_account into results element
            $(".results").html(`
                <div class="results_account">
                </div>
            `);

            // Clears displayed accounts
            this.displayedAccounts = [];

            // Displays result
            this.showResults();
            
            // Removes selected_nav_option from all other tabs except account_result
            $("#account_result").addClass("selected_nav_option");
            $("#tags_result").removeClass("selected_nav_option");
            $("#text_result").removeClass("selected_nav_option");
        });

        // Detects when caption tab is clicked
        $("#tags_result").click( () => {
            console.log("tags")
            // Sets result page to tag
            this.resultPage =  'tag';

            // Injects results_tags into results element
            $(".results").html(`
                <div class="results_tags">
                </div>
            `);
            
            // Displays result
            this.showResults();

            // Removes selected_nav_option from all other tabs except tags_result
            $("#tags_result").addClass("selected_nav_option");
            $("#account_result").removeClass("selected_nav_option");
            $("#text_result").removeClass("selected_nav_option");
        });

        // Detects when caption tab is clicked
        $("#text_result").click( () => {
            // Sets result page to text
            this.resultPage =  'text';

            // Injects results_text into results element
            $(".results").html(`
                <div class="results_text">
                </div>
            `);

            // Displays result
            this.showResults();
            
            // Removes selected_nav_option from all other tabs except text_result
            $("#text_result").addClass("selected_nav_option");
            $("#account_result").removeClass("selected_nav_option");
            $("#tags_result").removeClass("selected_nav_option");
        });
    }

    // Cancels get suggestion interval
    static ShouldCancelInterval(){
        // Cancels interval if current page is not feed.
        if (AppManager.currentPage != "feed"){
            SearchAndSuggestionsManager.displayedUsers = [];
            clearInterval(SearchAndSuggestionsManager.suggestionInterval);
            clearInterval(SearchAndSuggestionsManager.cancelInterval);
        }
        
    }

    // Gets follow suggestion
    static async getFollowSuggestion(){
        // Sends GET request to /M00933241/:id/suggestFollowing path
        try{

            const response = await fetch( `/M00933241/${SearchAndSuggestionsManager.userId}/suggestFollowing`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });

            // Converts response to json format
            var result = await response.json();
            var followList = result.followList;

            // Itterates over follow list
            for(var suggestion of followList){
                var displayedUsers = SearchAndSuggestionsManager.displayedUsers;
                // Gets index of displayed users
                var index = displayedUsers.indexOf(suggestion._id);

                // Checks if user is not displayed
                if(index == -1){

                    var suggestedFriend = SearchAndSuggestionsManager.constructSuggestion(
                        suggestion._id,
                        suggestion.profile_img,
                        suggestion.userName
                    );

                    // Injects suggestion into webpage
                    SearchAndSuggestionsManager.injectFollowSuggestions(suggestedFriend, suggestion);
                }
                
            }
            
        }catch(err){
            console.log("Issue getting follow suggestions \n Error: " + err)
        }
    }

    // Constructs suggestion
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
        // Appends suggested friend to follow suggestion
        $(".friend_suggestion").append(suggestedFriend);

        // Adds suggested friend id to displayed users array
        this.displayedUsers.push(suggestion._id);

        // Detects when a suggested friend's follow button is clicked
        $(`#${suggestion._id}_suggested_friend_follow_button`).click( async () => {
            // Removes the suggested friend from web page
            $(`#${suggestion._id}_suggested_friend`).remove();
            await AppManager.follow(suggestion._id);

            // Gets index of suggested friend
            var indexOfSuggestion = SearchAndSuggestionsManager.displayedUsers.indexOf(suggestion._id);

            // Removes suggested friend from displayed users array
            SearchAndSuggestionsManager.displayedUsers.splice(indexOfSuggestion, 1);

            // Gets all post
            AppManager.getAllPost();
        });

        // Detects when suggested friend username is clicked
        $(`#${suggestion._id}_suggested_friend_username`).click( async () => {
            AppManager.searchDivDisplay("down");
            var result = await AppManager.getUserData(suggestion._id);
            this.displayedAccount = result.result;

            var isfollowing = AppManager.isFollowing(this.displayedAccount._id);
            var accountString = this.constructAccontPage(isfollowing)
            $(".result_display").html(accountString);

            $(`#${suggestion._id}_follow_button`).click( () => {
                if($(`#${suggestion._id}_follow_button`).hasClass("search_following_button")){
                    $(`#${suggestion._id}_follow_button`).removeClass("search_following_button");
                    $(`#${suggestion._id}_follow_button`).addClass("search_follow_button");
                    $(`#${suggestion._id}_follow_button`).text("Follow");
                    AppManager.unfollow(suggestion._id);
                }else{
                    $(`#${suggestion._id}_follow_button`).removeClass("search_follow_button");
                    $(`#${suggestion._id}_follow_button`).addClass("search_following_button");
                    $(`#${suggestion._id}_follow_button`).text("Following");
                    AppManager.follow(suggestion._id);
                }
            });


            for (var post of this.displayedAccount.post){
                // Gets account post
                this.getAccountPost(post, isfollowing);
            }
        });
    }

    // Gets user's search
    static async getUserSearch(string){

        // Sends GET request to /M00933241/users/search path
        try{
            const response = await fetch( `/M00933241/users/search?idTag=${string}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });

            // Converts response to json format
            var result = await response.json();

            this.userNameResult = result.userByUsername;
            this.firstNameResult = result.userByFirstName;
            this.lastNameResult = result.userByLastName;

        }catch(err){
            console.log(`Issue getting user search for user \nError: ` + err);
        }
    }

    // Gets user's search by content.
    static async getContentSearch(string){
        // Sends GET request to /M00933241/content/search path
        try{
            const response = await fetch( `/M00933241/content/search?idTag=${string}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });

            // Converts response to json format
            var result = await response.json();
            this.captionResult = result.postByCaption;
            this.tagResult = result.postByTag;

        }catch(err){
            console.log(`Issue getting user search for tags and post\nError: ` + err);
        }
    }
    
    // Shows results
    static showResults(){
        // Checks if result page is account
        if(this.resultPage == "account"){
            // Itterates over uasername results
            for (var account of this.userNameResult){
                
                var displayedAccounts = this.displayedAccounts;

                // Gets index of displayed accounts
                var index = displayedAccounts.indexOf(account._id);

                // Checks if account isn't displayed
                if(index == -1){
                    this.displayedAccounts.push(account._id);
                    var accountString = this.constructAccount(account);
                    this.injectAccount(accountString,  account._id);

                }
                       
            }

            // Itterates over first name results
            for (var account of this.firstNameResult){
                
                var displayedAccounts = this.displayedAccounts;

                var index = displayedAccounts.indexOf(account._id);

                if(index == -1){
                    this.displayedAccounts.push(account._id);
                    var accountString = this.constructAccount(account);
                    this.injectAccount(accountString,  account._id);
                }
                       
            }
            // Itterates over last name results
            for (var account of this.lastNameResult){
                
                var displayedAccounts = this.displayedAccounts;

                // Gets index of displayed accounts
                var index = displayedAccounts.indexOf(account._id);

                // Checks if account isn't displayed
                if(index == -1){
                    this.displayedAccounts.push(account._id);
                    var accountString = this.constructAccount(account);
                    this.injectAccount(accountString,  account._id);
                }
                       
            }

        }else if(this.resultPage == "tag"){ // Checks if result page is tag
            // Itterates over tag result
            for (var postJSON of this.tagResult){
                // Constructs post
                var following = AppManager.isFollowing(postJSON.authorId);
                var post = PostManager.constructPost(postJSON, following, this.userId);
                console.log(postJSON.likes)
                AppManager.injectPost(post, postJSON._id, "tag", postJSON.authorId, postJSON.likes);  
        
            }

        }else{ // If result page is caption

            // Itterates over caption results
            for (var postJSON of this.captionResult){
                // Constructs post
                var following = AppManager.isFollowing(postJSON.authorId);
                var post = PostManager.constructPost(postJSON, following, this.userId);
                AppManager.injectPost(post, postJSON._id, "caption", postJSON.authorId, postJSON.likes);
            }
        }
    }

    // Constructs account for search 
    static constructAccount(accountInfo){
        var account = `
            <div class="search_follow_suggestion" id="${accountInfo._id}_search_suggeston">
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

    // Injects account into search
    static injectAccount(accountString, accountId){
        $(".results_account").append(accountString);

        $(`#${accountId}_search_suggeston`).click( async () => {
 
            var result = await AppManager.getUserData(accountId);
            this.displayedAccount = result.result;

            var isfollowing = AppManager.isFollowing(this.displayedAccount._id);
            var accountString = this.constructAccontPage(isfollowing)
            $(".result_display").html(accountString);

            $(`#${accountId}_follow_button`).click( () => {
                if($(`#${accountId}_follow_button`).hasClass("search_following_button")){
                    $(`#${accountId}_follow_button`).removeClass("search_following_button");
                    $(`#${accountId}_follow_button`).addClass("search_follow_button");
                    $(`#${accountId}_follow_button`).text("Follow");
                    AppManager.unfollow(accountId);
                }else{
                    $(`#${accountId}_follow_button`).removeClass("search_follow_button");
                    $(`#${accountId}_follow_button`).addClass("search_following_button");
                    $(`#${accountId}_follow_button`).text("Following");
                    AppManager.follow(accountId);
                }
            });


            for (var post of this.displayedAccount.post){
                // Gets account post
                this.getAccountPost(post, isfollowing);
            }
        });

    }

    // Creates account page string
    static constructAccontPage(isfollowing){
        var accountString = `
        
            <div class="search_account_div">
                <div class="search_account_info">
                    <div class="search_user_info_div">
                        <div class="search_user_profile_img">
                            <img src="${this.displayedAccount.profile_img}" alt="profile_picture" id="search_user_profile_img">
                        </div>
                        <div class="search_user_info">
                            <div class="search_user_username">
                                <span><b>${this.displayedAccount.userName}</b></span>
                            </div>
                            <div class="search_follow_info">
                                <span><b id="search_user_post_count">${this.displayedAccount.post.length}</b> Post</span>
                                <span><b id="search_user_followers_count">${this.displayedAccount.followers.length}</b> Followers</span>
                                <span><b id="search_user_following_count">${this.displayedAccount.following.length}</b> Following</span>
                            </div>
                            <div id="search_user_name">
                                <span><b>${this.displayedAccount.firstName}</b> <b>${this.displayedAccount.lastName}</b></span>
                            </div>

                            <div id="search_user_buttons">
                                <button id="${this.displayedAccount._id}_follow_button" class="${isfollowing == true? "search_following_button": "search_follow_button"}">
                                ${isfollowing == true? "Following": "Follow"}
                                </button>
                            </div>

                        </div>
                    </div>

                    <div class="search_user_post">

                    </div>

                </div>

            </div>
        `
        return accountString;
    }

    // gets user's post from server
    static async getAccountPost(posts, isFollowing, ){

        // Sends GET request to /M00933241/contents/:id path
        try{
            var response = await fetch( `/M00933241/contents/${posts}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            });
            
            // Gets response in json format
            var result = await response.json();
            var postJSON = result.post;

            // Constructs post
            var post = PostManager.constructPost(postJSON, isFollowing, this.displayedAccount._id);
            // Injects post into webpage
            AppManager.injectPost(post, postJSON._id, "search_account", postJSON.authorId, postJSON.likes);

        }catch(err){
            console.log(`Issue getting post ${posts} of user \nError: ` + err);
        }
        
    }

}


