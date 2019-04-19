/*
Lord Mendoza - 4/16/19

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

import {
    Button, ButtonToolbar,
    Col,
    Container, Form,
    OverlayTrigger, Popover,
    Row
} from "react-bootstrap";
import {FaPlus, FaQuestion, FaRedo, FaSearch, FaSlidersH, FaSync, FaTrash} from "react-icons/fa";


//======================================================================================================================
//================================= GLOBAL VARIABLES FOR GRID CONFIGURATION ============================================

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

        this.state = {
            columns: [],
            rows: [],
            columnLabels: [],
            columnWidths: [],
            pageSize: 10,
            pageSizes: [10, 50, 100],
            currentPage: 0,
            selection: [],
            editingStateColumnExtensions: [],
            nonSearchableColumns: [],
            searchValue: "",
            searchColumn: "default",
        };

        //In-line grid methods declarations
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

        //Helper functions of this component
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

    componentDidMount() {
        const {
            columns, rows, pageConfig, toggleSelect, viewConfig, colReorder, blockedColumns,
            blockedSearchColumns, remotePaging, currentPage, currentPageSize, totalCount
        } = this.props;

        //Setting up the columns
        let gridColumns = columns.map(v => {
            return {name: v.replace(/\s/g, ""), title: v};
        });

        //Setting up column labels
        let columnLabels = columns;

        //Setting up the rows
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

        //Setting up the page sizes for paging
        let pageSize = 10;
        let pageSizes = [10, 50, 100];
        if (pageConfig !== undefined) {
            if (pageConfig.length === 2) {
                pageSize = pageConfig[0];
                pageSizes = pageConfig[1];
            }
        }

        //Setting up selection state if its enabled or not
        let selectionToggled = false;
        if (toggleSelect !== undefined) {
            if (toggleSelect)
                selectionToggled = toggleSelect;
        }

        //Setting up widths for viewing
        let columnWidths = columns.map(v => {
            return {columnName: v.replace(/\s/g, ""), width: 180};
        });

        //Checking if the user opted to allow column reordering
        let columnReordering = false;
        if (colReorder)
            columnReordering = true;

        //Checking if the user opted to render a grid with a menu
        let viewSetup = "simple";
        if (viewConfig !== undefined) {
            if (viewConfig === "search" || viewConfig === "allnosearch" || viewConfig === "all"
                || viewConfig === "bare")
                viewSetup = viewConfig;
            else
                viewSetup = "simple";
        }

        //Configuring certain columns to not be editable as applicable
        let nonEditableColumns = [];
        if (blockedColumns !== undefined) {
            if (blockedColumns.length > 0) {
                blockedColumns.forEach(v => {
                    nonEditableColumns.push({columnName: v.replace(/\s/g, ""), editingEnabled: false});
                });
            }
        }

        //Configuring certain columns to not be searchable as applicable
        let nonSearchableColumns = [];
        if (blockedSearchColumns !== undefined) {
            if (blockedSearchColumns.length > 0) {
                nonSearchableColumns = blockedSearchColumns;
            }
        }

        //Checking if remote paging is toggled
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
            columns: gridColumns, rows: gridRows, columnLabels, columnOrder: columns, pageSize, pageSizes,
            selectionToggled, viewSetup, columnWidths, columnReordering, editingMode, deletionSelection: [],
            editingRowIds: [], rowChanges: [], editingStateColumnExtensions: nonEditableColumns, nonSearchableColumns,
            searchValue, searchColumn, remotePagingToggled, totalDataCount
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.columns !== prevProps.columns || this.props.rows !== prevProps.rows) {

        }
    }

    //==================================================================================================================
    //====================== HELPER FUNCTIONS FOR PASSING DATA TO PARENT COMPONENT =====================================

    handleSelectedValues() {
        if (this.props.selectedValues !== undefined) {
            const {rows, selection} = this.state;

            let selectedRows = selection.map(v => {
                return rows[v];
            });

            this.props.selectedValues(selectedRows);
        }
    }

    changeEditState() {
        const {viewSetup, editingMode} = this.state;

        if (viewSetup === "all" || viewSetup === "allnosearch")
            this.setState({editingMode: !editingMode});
    }

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
    At the moment, commit changes gets called each time "save" is pressed, and it will pass an array containing:
    [ [row that was changed], [changes to that row] ]

    When the next changes are made, commit changes gets called again and the previous value gets overwritten
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

    performRefresh() {
        if (this.props.refreshToggled !== undefined) {
            this.props.refreshToggled();
        }
    }

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

    createEntry() {
        if (this.props.createToggled !== undefined) {
            this.props.createToggled();
        }
    }

    changeCurrentPage = currentPage => {
        if (this.state.remotePagingToggled)
            this.setState({currentPage}, this.props.currentPage(currentPage));
        else
            this.setState({currentPage});

    };

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
            deletionSelection, nonSearchableColumns, remotePagingToggled, totalDataCount
        } = this.state;

        //Enabling selection or not
        let selectionState;
        let integratedSelection;
        let tableSelection;
        if (selectionToggled && this.props.selectedValues !== undefined &&
            (viewSetup === "simple" || viewSetup === "search")) {
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

        //Declaring the refresh button
        let refresh;
        if (viewSetup !== "bare")
            refresh = <Button variant="primary" onClick={this.performRefresh}>
                <FaSync/> Refresh
            </Button>;

        //Handling what appears in the menu bar based on viewConfig
        let menuOptions;
        let searchColumns = [<option disabled value={"default"} key={0}>Select Column...</option>];
        columnLabels.filter(v => (!nonSearchableColumns.includes(v)))
            .forEach(v => {
                searchColumns.push(<option value={v}> {v} </option>);
            });

        if (viewSetup !== "simple") {
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
            } else if (viewSetup === "allnosearch") {
                menuOptions = <Form inline="true">
                    {btnAdd} {btnEdit}
                </Form>;

            } else if (viewSetup === "all") {
                menuOptions = <Form inline="true">
                    <Form.Group>
                        {btnAdd} {btnEdit}

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
