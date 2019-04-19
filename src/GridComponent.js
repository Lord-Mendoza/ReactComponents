/*
Lord Mendoza - 4/19/19

*/
//======================================================================================================================
//============================================= IMPORTS ================================================================

//React
import React, {Component} from 'react';
import './GridComponent.css';

//DevExpress Grid
import {
    EditingState,
    IntegratedPaging, IntegratedSelection,
    IntegratedSorting,
    PagingState,
    CustomPaging,
    SelectionState,
    SortingState
} from "@devexpress/dx-react-grid";
import {
    Grid, PagingPanel, DragDropProvider,
    Table, TableColumnResizing,
    TableHeaderRow, TableSelection, TableColumnReordering, TableEditColumn, TableEditRow,
} from '@devexpress/dx-react-grid-bootstrap4';
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";

//React-Bootstrap
import {
    Button, ButtonToolbar,
    Col,
    Container, Form,
    OverlayTrigger, Popover,
    Row
} from "react-bootstrap";
import {FaPlus, FaQuestion, FaRedo, FaSearch, FaSlidersH, FaSync, FaTrash} from "react-icons/fa";


//======================================================================================================================
//================================= GLOBAL VARIABLE FOR GRID CONFIGURATION =============================================

const TableComponent = ({...restProps}) => (
    <Table.Table
        {...restProps}
        className="table-striped"
    />
);

//======================================================================================================================
//=========================================== START OF CLASS ===========================================================

class GridComponent extends Component {
    constructor(props, context) {
        super(props, context);

        //-------------------------------------- STATE VALUES ----------------------------------------------------------
        this.state = {
            //Required for rendering data in the grid
            columns: [],
            rows: [],

            //Custom Configurations
            columnLabels: [],
            columnWidths: [],
            pageSize: 10,
            pageSizes: [10, 50, 100],
            currentPage: 0,

            //For passing back the selected values to parent component
            selection: [],

            //For customizing the search components as well as sending that data back to parent component
            editingStateColumnExtensions: [],
            nonSearchableColumns: [],
            searchValue: "",
            searchColumn: "default",
        };

        //In-line methods that is better to be declared here rather than outside the constructor (since its simple)
        this.changeSorting = sorting => this.setState({sorting});
        this.changeColumnWidths = (columnWidths) => {
            this.setState({columnWidths})
        };
        this.changeSelection = selection => {
            this.setState({selection}, this.handleSelectedValues)
        };
        this.changeDeletionSelection = selection => {
            this.setState({deletionSelection: selection})
        };
        this.changeColumnOrder = (newOrder) => {
            this.setState({columnOrder: newOrder})
        };
        this.changeEditingRowIds = (editingRowIds) => {
            if (this.state.editingRowIds.length < 1)
                this.setState({editingRowIds});
        };
        this.changeRowChanges = (rowChanges) => {
            if (this.state.editingRowIds.length === 1 && Object.keys(rowChanges).length === 0)
                this.setState({editingRowIds: [], rowChanges});
            else
                this.setState({rowChanges});
        };
        this.handleSearchValueChange = (event) => {
            this.setState({searchValue: event.target.value});
        };
        this.handleSearchColumnChange = (event) => {
            this.setState({searchColumn: event.target.value});
        };
        this.resetSearch = () => {
            this.setState({searchValue: "", searchColumn: "default"})
        };

        //Helper functions of this component that are more complicated to declare inside the constructor
        this.handleSelectedValues = this.handleSelectedValues.bind(this);
        this.changeEditState = this.changeEditState.bind(this);
        this.deleteSelected = this.deleteSelected.bind(this);
        this.commitChanges = this.commitChanges.bind(this);
        this.performRefresh = this.performRefresh.bind(this);
        this.createEntry = this.createEntry.bind(this);
        this.performSearch = this.performSearch.bind(this);
        this.changeCurrentPage = this.changeCurrentPage.bind(this);
        this.changePageSize = this.changePageSize.bind(this);
    }

    //==================================================================================================================
    //================================== REACT STATE COMPONENTS ========================================================

    /*
    When the GridComponent mounts in the React app, then this gets called to initialize the GridComponent's state based
    on the values passed in through props.
     */
    componentDidMount() {
        const {
            columns, rows, pageConfig, toggleSelect, viewConfig, colReorder, blockedColumns,
            blockedSearchColumns, remotePaging, currentPage, currentPageSize, totalCount
        } = this.props;

        //Setting up the columns for rendering
        let gridColumns = columns.map(v => {
            return {name: v.replace(/\s/g, ""), title: v};
        });

        //Setting up column labels to be used later by search component
        let columnLabels = columns;

        //Setting up the rows (data)
        let gridRows = [];
        rows.forEach(v => {
            let gridRow = {};

            columns.forEach(p => {
                if (v.hasOwnProperty(p)) {
                    gridRow[p.replace(/\s/g, "")] = v[p];
                }
            });

            gridRows.push(gridRow);
        });

        //Setting up the page sizes if the developer provides such information, but assigning default values should
        //they choose to omit it.
        let pageSize = 10;
        let pageSizes = [10, 50, 100];
        if (pageConfig !== undefined) {
            if (pageConfig.length === 2) {
                pageSize = pageConfig[0];
                pageSizes = pageConfig[1];
            }
        }

        //Setting up selection state depending on if its enabled or not
        let selectionToggled = false;
        if (toggleSelect !== undefined) {
            if (toggleSelect)
                selectionToggled = toggleSelect;
        }

        //Setting up initial widths for viewing
        let columnWidths = columns.map(v => {
            return {columnName: v.replace(/\s/g, ""), width: 180};
        });

        //Checking if the developer opted to allow column reordering
        let columnReordering = false;
        if (colReorder)
            columnReordering = true;

        //Checking which viewSetup the developer went with. Consult the wiki for more details on the individual
        //options.
        let viewSetup = "simple";
        if (viewConfig !== undefined) {
            if (viewConfig === "search" || viewConfig === "allnosearch" || viewConfig === "all"
                || viewConfig === "bare")
                viewSetup = viewConfig;
            else
                viewSetup = "simple";
        }

        //Configuring certain columns to not be editable based on the developer's choice.
        let nonEditableColumns = [];
        if (blockedColumns !== undefined) {
            if (blockedColumns.length > 0) {
                blockedColumns.forEach(v => {
                    nonEditableColumns.push({columnName: v.replace(/\s/g, ""), editingEnabled: false});
                });
            }
        }

        //Configuring certain columns to not be searchable based on the developer's choice.
        let nonSearchableColumns = [];
        if (blockedSearchColumns !== undefined) {
            if (blockedSearchColumns.length > 0) {
                nonSearchableColumns = blockedSearchColumns;
            }
        }

        //Checking if remote paging is toggled; else the integrated paging is performed
        let remotePagingToggled = false;
        let totalDataCount = 0;
        if (remotePaging !== undefined && currentPageSize !== undefined && currentPage !== undefined
            && totalCount !== undefined) {
            remotePagingToggled = remotePaging;
            totalDataCount = totalCount;
        }

        //Initializing other state props
        let editingMode = false;
        let searchValue = "";
        let searchColumn = "default";

        this.setState({
            //Required values for rendering the grid
            columns: gridColumns, rows: gridRows,

            //Additional grid configurations
            columnLabels, columnOrder: columns,
            columnWidths, columnReordering, editingMode,
            pageSize, pageSizes,
            selectionToggled,

            //Tracking which grid view the developer opted for
            viewSetup,

            //Tracking which rows are deleted/edited/search to be passed back to parent component
            deletionSelection: [], editingRowIds: [], rowChanges: [],
            searchValue, searchColumn,

            //Configuring the search component
            editingStateColumnExtensions: nonEditableColumns, nonSearchableColumns,

            //Remote paging configuration
            remotePagingToggled, totalDataCount,
        });
    }

    /*
    If changes occur in the parent component involving the required sections of the grid
    (new data is loaded, new columns) then the GridComponent's state is re-initialized again
     */
    componentDidUpdate(prevProps) {
        if (this.props.columns !== prevProps.columns || this.props.rows !== prevProps.rows) {
            const {
                columns, rows, pageConfig, toggleSelect, viewConfig, colReorder, blockedColumns,
                blockedSearchColumns, remotePaging, currentPage, currentPageSize, totalCount
            } = this.props;

            //Setting up the columns for rendering
            let gridColumns = columns.map(v => {
                return {name: v.replace(/\s/g, ""), title: v};
            });

            //Setting up column labels to be used later by search component
            let columnLabels = columns;

            //Setting up the rows (data)
            let gridRows = [];
            rows.forEach(v => {
                let gridRow = {};

                columns.forEach(p => {
                    if (v.hasOwnProperty(p)) {
                        gridRow[p.replace(/\s/g, "")] = v[p];
                    }
                });

                gridRows.push(gridRow);
            });

            //Setting up the page sizes if the developer provides such information, but assigning default values should
            //they choose to omit it.
            let pageSize = 10;
            let pageSizes = [10, 50, 100];
            if (pageConfig !== undefined) {
                if (pageConfig.length === 2) {
                    pageSize = pageConfig[0];
                    pageSizes = pageConfig[1];
                }
            }

            //Setting up selection state depending on if its enabled or not
            let selectionToggled = false;
            if (toggleSelect !== undefined) {
                if (toggleSelect)
                    selectionToggled = toggleSelect;
            }

            //Setting up initial widths for viewing
            let columnWidths = columns.map(v => {
                return {columnName: v.replace(/\s/g, ""), width: 180};
            });

            //Checking if the developer opted to allow column reordering
            let columnReordering = false;
            if (colReorder)
                columnReordering = true;

            //Checking which viewSetup the developer went with. Consult the wiki for more details on the individual
            //options.
            let viewSetup = "simple";
            if (viewConfig !== undefined) {
                if (viewConfig === "search" || viewConfig === "allnosearch" || viewConfig === "all"
                    || viewConfig === "bare")
                    viewSetup = viewConfig;
                else
                    viewSetup = "simple";
            }

            //Configuring certain columns to not be editable based on the developer's choice.
            let nonEditableColumns = [];
            if (blockedColumns !== undefined) {
                if (blockedColumns.length > 0) {
                    blockedColumns.forEach(v => {
                        nonEditableColumns.push({columnName: v.replace(/\s/g, ""), editingEnabled: false});
                    });
                }
            }

            //Configuring certain columns to not be searchable based on the developer's choice.
            let nonSearchableColumns = [];
            if (blockedSearchColumns !== undefined) {
                if (blockedSearchColumns.length > 0) {
                    nonSearchableColumns = blockedSearchColumns;
                }
            }

            //Checking if remote paging is toggled; else the integrated paging is performed
            let remotePagingToggled = false;
            let totalDataCount = 0;
            if (remotePaging !== undefined && currentPageSize !== undefined && currentPage !== undefined
                && totalCount !== undefined) {
                remotePagingToggled = remotePaging;
                totalDataCount = totalCount;
            }

            //Initializing other state props
            let editingMode = false;
            let searchValue = "";
            let searchColumn = "default";

            this.setState({
                //Required values for rendering the grid
                columns: gridColumns, rows: gridRows,

                //Additional grid configurations
                columnLabels, columnOrder: columns,
                columnWidths, columnReordering, editingMode,
                pageSize, pageSizes,
                selectionToggled,

                //Tracking which grid view the developer opted for
                viewSetup,

                //Tracking which rows are deleted/edited/search to be passed back to parent component
                deletionSelection: [], editingRowIds: [], rowChanges: [],
                searchValue, searchColumn,

                //Configuring the search component
                editingStateColumnExtensions: nonEditableColumns, nonSearchableColumns,

                //Remote paging configuration
                remotePagingToggled, totalDataCount,
            });
        }
    }

    //==================================================================================================================
    //====================== HELPER FUNCTIONS FOR PASSING DATA TO PARENT COMPONENT =====================================

    /*
    Grabs the selected values and uses the callback function in parent component to pass said data.

    Invoked only when selectedValues prop is set to true
     */
    handleSelectedValues() {
        if (this.props.selectedValues !== undefined) {
            const {rows, selection} = this.state;

            let selectedRows = selection.map(v => {
                return rows[v];
            });

            this.props.selectedValues(selectedRows);
        }
    }

    /*
    Flipping the "edit mode" state which renders a different grid configuration than default

    Invoked only when viewSetup is set to "all" / "allnosearch" since they provide the buttons for
    editing/deleting
     */
    changeEditState() {
        const {viewSetup, editingMode} = this.state;

        if (viewSetup === "all" || viewSetup === "allnosearch")
            this.setState({editingMode: !editingMode});
    }

    /*
    Passing the deleted rows back to parent component for performing the actual deletion. It will also
    clear the selection for next use.

    Invoked only when viewSetup is set to "all" / "allnosearch" since they provide the buttons for deleting.
     */
    deleteSelected() {
        if (this.props.deletedValues !== undefined) {
            const {rows, deletionSelection} = this.state;

            let deletedRows = deletionSelection.map(v => {
                return rows[v];
            });

            this.props.deletedValues(deletedRows);

            this.setState({deletionSelection: []})
        }
    }

    /*
    Passing the row that was changed as well as the changes made in a single array back to the parent
    component. It's sent back in the form:
        [ {the row that was edited, as passed in the "rows" prop} , {the changes made to that row} ]

    Ex. Let's say in the parent component we did something like:
        <GridComponent columns={["Name", "Age"]}
                       rows={ [ {Name: "Lord", Age: "24"}, {Name: "Daniel", Age: "23"} ] }
                       ... />
        If the first row (Lord, 24) was changed with the name changing to "Matt", then the data will be
        passed in like

                  row changed           changes
        [ {Name: "Lord", Age: "24"}, {Name: "Matt} ]
    */
    commitChanges({changed}) {
        const {rows, rowChanges} = this.state;

        if (changed && rowChanges.length !== 0) {
            let submittedChanges = [];

            for (let prop in rowChanges) {
                if (rowChanges.hasOwnProperty(prop)) {
                    let rowChanged = [rows[prop]];
                    rowChanged.push(rowChanges[prop]);
                    submittedChanges.push(rowChanged);
                }
            }

            if (this.props.editedValues !== undefined && Object.keys(rowChanges).length !== 0)
                this.props.editedValues(submittedChanges);
        }
    }

    /*
    Triggering the callback for clicking the refresh button.

    Note that GridComponent will NOT handle your data for you. When this method is invoked it
    gives you a hint that the user wants to reload the data; therefore you must look into
    updating the data passed in for "rows" prop.
    */
    performRefresh() {
        if (this.props.refreshToggled !== undefined) {
            this.props.refreshToggled();
        }
    }

    /*
    Passing the search values to the parent component. Comes as a JSON object like:
    { searchColumn: searchValue }

    Ex. Let's say the user chose to search by column "Name" and their search value is "Lord". Then the
    return value is:
    { "Name": "Lord }
    */
    performSearch() {
        if (this.props.searchValue !== undefined) {
            const {searchValue, searchColumn} = this.state;

            if (searchValue !== "" && searchColumn !== "") {
                let searchObject = {};
                searchObject[searchColumn] = searchValue;
                this.props.searchValue(searchObject);
            }
        }
    }

    /*
    Triggering the callback for clicking the create button.

    Note that GridComponent will NOT handle the data creation. You can choose to handle this creation phase as
    you desire, whether you'll respond with a modal that includes the form or however else you wish.
    */
    createEntry() {
        if (this.props.createToggled !== undefined) {
            this.props.createToggled();
        }
    }

    /*
    Changes the page based on user interaction

    If remotePaging is toggled to true, then the current page value is sent back to the parent prop.
    */
    changeCurrentPage = currentPage => {
        if (this.state.remotePagingToggled)
            this.setState({currentPage}, this.props.currentPage(currentPage));
        else
            this.setState({currentPage});

    };

    /*
    Changes the page size based on user interaction

    If remotePaging is toggled to true, then the current page size value is sent back to the parent prop.
    */
    changePageSize = pageSize => {
        if (this.state.remotePagingToggled)
            this.setState({pageSize}, this.props.currentPageSize(pageSize));
        else
            this.setState({pageSize});
    };

    //=========================================== RENDER ===============================================================
    render() {
        //Retrieving all state values
        const {
            rows, columns, columnLabels, sorting, columnWidths, pageSize, pageSizes, currentPage,
            selection, selectionToggled, viewSetup, columnReordering, columnOrder, editingMode,
            deletionSelection, nonSearchableColumns, totalDataCount
        } = this.state;

        //Determining whether to display the select checkboxes to the left of the rows or not
        //Note that this checks if the viewSetup is set to bare, simple, or search. If its neither
        //of those three, then this won't be rendered (since checkboxes will appear already for
        //delete/edit mode)
        let selectionState;
        let integratedSelection;
        let tableSelection;
        if (selectionToggled && this.props.selectedValues !== undefined &&
            (viewSetup === "simple" || viewSetup === "search" || viewSetup === "bare")) {
            selectionState = <SelectionState
                selection={selection}
                onSelectionChange={this.changeSelection}
            />;
            integratedSelection = <IntegratedSelection/>;
            tableSelection = <TableSelection
                selectByRowClick
            />;
        }

        //Enabling column reordering or not
        let dragDropProvider;
        let tableColumnReordering;
        if (columnReordering) {
            dragDropProvider = <DragDropProvider/>;
            tableColumnReordering = <TableColumnReordering
                order={columnOrder}
                onOrderChange={this.changeColumnOrder}/>;
        }

        //Declaring the add button
        let btnAdd = <Button variant="success" style={{marginRight: 5, borderLeft: 0}}
                             onClick={this.createEntry}>
            <FaPlus/> Create Entry
        </Button>;

        //Declaring the Show/Hide Edit/Delete button based on editing state
        let btnEdit, options, multiSelect, deleteSelected, deleteHint;
        if ((viewSetup === "all" || viewSetup === "allnosearch") && !editingMode) {
            btnEdit = <Button variant="info" style={{marginRight: 15, borderLeft: 0}}
                              onClick={this.changeEditState}>
                <FaSlidersH/> Show Edit/Delete
            </Button>;
            options = <TableEditColumn width={0}/>;
        } else if ((viewSetup === "all" || viewSetup === "allnosearch") && editingMode) {
            btnEdit = <Button variant="info" style={{marginRight: 15, borderLeft: 0}}
                              onClick={this.changeEditState}>
                <FaSlidersH/> Hide Edit/Delete
            </Button>;

            options = <TableEditColumn showEditCommand/>;
            multiSelect = <TableSelection selectByRowClick/>;

            selectionState = <SelectionState
                selection={deletionSelection}
                onSelectionChange={this.changeDeletionSelection}
            />;
            integratedSelection = <IntegratedSelection/>;

            deleteSelected = <Button variant="danger" onClick={this.deleteSelected}>
                <FaTrash/> Delete Selected </Button>;
            deleteHint = <ButtonToolbar>
                <OverlayTrigger trigger="hover" key="right" placement="right"
                                overlay={
                                    <Popover id={`popover-position-right`}
                                             title={`Hint`}>

                                        To make selection(s), either click on the checkbox or directly
                                        on the row.
                                    </Popover>
                                }
                >

                    <Button variant="light" style={{marginLeft: 5}}><FaQuestion/></Button>

                </OverlayTrigger>
            </ButtonToolbar>;
        }

        //Declaring the refresh button; note that it checks if the viewSetup is bare & avoids rendering if so.
        let refresh;
        if (viewSetup !== "bare")
            refresh = <Button variant="primary" onClick={this.performRefresh}>
                <FaSync/> Refresh
            </Button>;

        //Handling what appears in the menu bar based on viewConfig
        let menuOptions;
        let count = 0;
        let searchColumns = [<option disabled value={"default"} key={0}>Select Column...</option>];
        columnLabels.filter(v => (!nonSearchableColumns.includes(v)))
            .forEach(v => {
                searchColumns.push(<option value={v} key={count+1}> {v} </option>);
                count++;
            });

        //If simple is selected, then nothing else but the grid, pagination/page sizing & refresh buttons will appear.
        if (viewSetup !== "simple") {

            //Else if search is selected, then all of the above + search components will appear
            if (viewSetup === "search") {
                menuOptions = <Form inline="true">
                    <Form.Group>
                        <Form.Control as="select"
                                      onChange={this.handleSearchColumnChange}
                                      defaultValue="default"
                                      value={this.state.searchColumn}
                                      style={{fontSize: 12, marginRight: 5}}>
                            {searchColumns}
                        </Form.Control>

                        <Form.Control style={{fontSize: 12, marginRight: 5}}
                                      type="text"
                                      onChange={this.handleSearchValueChange}
                                      value={this.state.searchValue}
                                      placeholder="Search Value"/>
                    </Form.Group>

                    <Button variant="outline-dark" style={{marginRight: 5}}
                            onClick={this.performSearch}> <FaSearch/> </Button>
                    <Button variant="outline-dark"
                            onClick={this.resetSearch}> <FaRedo/> </Button>
                </Form>;

            //Else if search components are not toggled, then they will be hidden
            } else if (viewSetup === "allnosearch") {
                menuOptions = <Form inline="true">
                    {btnAdd} {btnEdit}
                </Form>;

            //Otherwise, render everything
            } else if (viewSetup === "all") {
                menuOptions = <Form inline="true">
                    <Form.Group>
                        {btnAdd} {btnEdit}

                        <Form.Control as="select"
                                      onChange={this.handleSearchColumnChange}
                                      value={this.state.searchColumn}
                                      style={{fontSize: 12, marginRight: 5}}>
                            {searchColumns}
                        </Form.Control>

                        <Form.Control style={{fontSize: 12, marginRight: 5}}
                                      type="text"
                                      onChange={this.handleSearchValueChange}
                                      value={this.state.searchValue}
                                      placeholder="Search Value"/>
                    </Form.Group>

                    <Button variant="outline-dark" style={{marginRight: 5}}
                            onClick={this.performSearch}> <FaSearch/> </Button>
                    <Button variant="outline-dark"
                            onClick={this.resetSearch}> <FaRedo/> </Button>
                </Form>;
            }
        }

        //Configuring which paging setup to use
        let pagingPlugin;
        if (this.props.remotePaging !== undefined) {
            if (this.props.remotePaging)
                pagingPlugin = <CustomPaging
                    totalCount={totalDataCount}
                />;
            else
                pagingPlugin = <IntegratedPaging/>;
        }
        else{
            pagingPlugin = <IntegratedPaging/>;
        }


        return (
            <div style={{fontSize: '12px'}}>

                {/*=============================== Menu Bar Portion ===============================*/}

                <Container fluid={true} style={{marginRight: 1}}>
                    <Row noGutters={true}>
                        <Col>
                            {menuOptions}
                        </Col>

                        <Col xs="auto" style={{float: 'right', textAlign: 'right', marginRight: '0px'}}>
                            {refresh}
                        </Col>
                    </Row>
                    <Row noGutters={true} style={{paddingTop: 5}}>
                        {deleteSelected}
                        {deleteHint}
                    </Row>
                </Container>

                {/*=============================== Grid Portion ===============================*/}
                <Grid
                    rows={rows}
                    columns={columns}
                >
                    <SortingState
                        sorting={sorting}
                        onSortingChange={this.changeSorting}
                    />

                    <EditingState
                        editingRowIds={this.state.editingRowIds}
                        onEditingRowIdsChange={this.changeEditingRowIds}
                        rowChanges={this.state.rowChanges}
                        onRowChangesChange={this.changeRowChanges}
                        onCommitChanges={this.commitChanges}

                        columnExtensions={this.state.editingStateColumnExtensions}
                    />

                    <PagingState
                        currentPage={currentPage}
                        onCurrentPageChange={this.changeCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={this.changePageSize}
                    />

                    {selectionState}
                    {dragDropProvider}

                    {integratedSelection}
                    {pagingPlugin}

                    <IntegratedSorting/>
                    <Table
                        tableComponent={TableComponent}
                    />

                    <TableColumnResizing
                        columnWidths={columnWidths}
                        onColumnWidthsChange={this.changeColumnWidths}
                    />

                    <TableHeaderRow showSortingControls/>
                    <TableEditRow/>
                    {options}
                    {multiSelect}

                    {tableColumnReordering}

                    {tableSelection}

                    <PagingPanel
                        pageSizes={pageSizes}
                    />
                </Grid>

            </div>
        );
    }
}

export default GridComponent;
