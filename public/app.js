$(document).ready(function () {

    // -------------------- Buttons for not Saved page ----------------------//

    // Scrape any new articles, if the request is ok, reload the page
    $('#scrape-btn').on('click', function () {
        event.preventDefault();
        $.ajax({
            type: 'GET',
            url: '/scrapedNews',
        }).done(function (res) {
            if (res === 'OK') {
                window.location.href = "/";
            } else {
                alert('Please try again');
            }
        });

    });

    // Send Request to server to save the article
    $('.save-art-btn').on('click', function () {
        event.preventDefault();
        let artId = $(this).parent().parent().attr('data-artId');

        $.ajax({
            type: 'PUT',
            url: `/saved/${artId}`,
        }).done(function (res) {
            if (res === 'OK') {
                window.location.href = "/";
            } else {
                alert('Please try again');
            }
        });

    });

    // -------------------- Buttons for Saved page ----------------------//


    // Removed a saved article from the database
    $('.remove-saved').on('click', function () {
        event.preventDefault();

        let savedId = $(this).parent().parent().parent().attr('data-savedId');

        $.ajax({
            type: 'PUT',
            url: `/unsaved/${savedId}`,
        }).done(function (res) {
            if (res === 'OK') {
                window.location.href = '/savedArticles';
            } else {
                alert('Bad request, please try again')
            }
        });

    });


    // Adding a note to one of the articles
    $('.add-note').on('click', function () {
        event.preventDefault();

        // empty object to store the comment and pass to server
        let newComment = {}

        let commentBody = $(this).parent().siblings('.form-group').find('textarea').val();
        let articleId = $(this).closest('.modal').attr('id');

        if (commentBody && articleId) {
            // if there is a comment and article id, then send update request to server and clear the textarea
            newComment.body = commentBody;
            //Clear any text area once a note has been added
            $('.comment-text').val('');

            $.ajax({
                type: 'POST',
                data: newComment,
                url: `/newNote/${articleId}`
            }).done(function (res) {
                if (res === 'Created') {
                    window.location.href = '/savedArticles';
                }
            });
        } else {
            $('.comment-text').addClass('border-danger');
        }
    });

    // remove the red from any of the textarea's if the user is going to fill it in
    $('.comment-text').on('click', function () {
        if ($(this).hasClass('border-danger')) {
            $(this).removeClass('border-danger');
        }
    });

    $('.delete-note').on('click', function () {
        event.preventDefault();

        let noteId = $(this).parents().attr('data-noteId');

        $.ajax({
            type: 'DELETE',
            url: `/notes/delete/${noteId}`
        }).done(function (res) {
            if (res === 'Accepted') {
                window.location.href = '/savedArticles'; 
            } else {
                alert('Could not delete, please try again')
            }
        });
    });


}); 