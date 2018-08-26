$(document).ready(function () {
    

    // Buttons for not Saved page
    $('#scrape-btn').on('click', function() {
        console.log('should be scraping')
    }); 

    $('.save-art-btn').on('click', function () {
        event.preventDefault(); 
        let artId = $(this).parent().parent().attr('data-artId'); 

        $.ajax({
            type: 'PUT',
            url: `/saved/${artId}`,
        }).done(function (res) {
            console.log(res);
        })

    }); 

    // Buttons for saved page

    $('.remove-saved').on('click', function () {
        event.preventDefault(); 
        let savedId = $(this).parent().parent().parent().attr('data-savedId'); 

        console.log(savedId)

        $.ajax({
            type: 'PUT',
            url: `/unsaved/${savedId}`,
        }).done(function (res) {
            console.log(res);
        }); 

    }); 

    
    $('.add-note').on('click', function () {
        event.preventDefault(); 

        let newComment = {}

        let commentBody = $(this).parent().siblings('.form-group').find('textarea').val(); 
        let articleId = $(this).closest('.modal').attr('id'); 


            if (commentBody && articleId) {

             newComment.body = commentBody; 

                $.ajax({
                    type: 'POST',
                    data: newComment, 
                    url: `/newNote/${articleId}`
                }).done(function (res) {
                    console.log(res);
                }); 
            }


    }); 

    $('.delete-note').on('click', function () {
        event.preventDefault(); 

        let noteId = $(this).parents().attr('data-noteId'); 

                $.ajax({
                    type: 'DELETE',
                    url: `/notes/delete/${noteId}`
                }).done(function (res) {
                    console.log(res);
                }); 
      


    }); 
   
   

 

}); 