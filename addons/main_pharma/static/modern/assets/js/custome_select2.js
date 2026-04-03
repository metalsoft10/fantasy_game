function set_select2_elm(placeholder, url, el, options,auto_select = true) {
    const defaultOptions = {
        placeholder: placeholder,
        allowClear: true,
        ajax: {
            url: url,
            dataType: 'json',
            delay: 250,
            data: function (params) {
                
                return {
                    
                    searchTerm: params.term || '' // search term
                };
            },
            processResults: function (response, params) {
                const searchTerm = params.term ? params.term.toLowerCase() : '';
                const filteredResults = response.filter(item => 
                    item.text.toLowerCase().includes(searchTerm)
                );
                
                return { results: filteredResults };
            },
        },
        language: {
            noResults: function () {
                return "No results found";
            }
        },
        escapeMarkup: function (markup) {
            return markup;
        }
    };

    
    const select2Options = $.extend(true, {}, defaultOptions, options);

    
    if ($(el).length) {
        $(el).select2(select2Options);
        if(auto_select){

            $.ajax({
                url: url,
                dataType: 'json',
                success: function(data) {
                    // أضف جميع الخيارات إلى select2
                    data.forEach(function(item) {
                        var option = new Option(item.text, item.id, false, false);
                        $(el).append(option);
                    });

                    // حدد العناصر اللي selected = true
                    var selectedItems = data.filter(item => item.selected === true).map(item => item.id);

                    if (selectedItems.length > 0) {
                        $(el).val(selectedItems).trigger('change');
                    }
                }
            });


        }
        
    }

}

