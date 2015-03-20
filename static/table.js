$('head').append('<link rel="stylesheet" href="//cdn.datatables.net/1.10.5/css/jquery.dataTables.min.css" type="text/css" />');
$(document).ready(function () {
    $('#maintable tfoot th').each( function () {
        var title = $('#maintable thead th').eq( $(this).index() ).text();
        if (title) {
            $(this).html( '<input type="text" placeholder="Search ' + title + '" />' );
        }
    } );
    var table = $('#maintable').DataTable({
        processing : true,
        dom : 'lrtip',
        columns : [
            null,
            null,
            {
                orderable : false,
                searchable : false
            }
        ]
    });

    table.columns().eq( 0 ).each( function ( colIdx ) {
        $( 'input', table.column( colIdx ).footer() ).on( 'keyup change', function () {
            table
                .column( colIdx )
                .search( this.value )
                .draw();
        } );
    } );

    var r = $('#maintable tfoot tr');
    r.find('th').each(function () {
        $(this).css('padding', 8);
    });
    $('#maintable thead').append(r);
    $('#search_0').css('text-align', 'center');
});