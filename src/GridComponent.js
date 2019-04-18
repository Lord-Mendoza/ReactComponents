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
            columnWidths: [],
            pageSize: 10,
            pageSizes: [10, 50, 100],
            currentPage: 0,
            selection: []
        };

        //In-line grid methods declarations
        this.changeSorting = sorting => this.setState({sorting});
        this.changeColumnWidths = (columnWidths) => {
            this.setState({columnWidths})
        };
        this.changeCurrentPage = currentPage => this.setState({currentPage});
        this.changePageSize = pageSize => this.setState({pageSize});
        this.changeSelection = selection => {
            this.setState({selection}, this.handleSelectedValues)
        };
        this.changeColumnOrder = (newOrder) => {
            this.setState({columnOrder: newOrder})
        };

        //Helper functions of this component
        this.handleSelectedValues = this.handleSelectedValues.bind(this);
        this.changeEditState = this.changeEditState.bind(this);
    }

    //==================================================================================================================
    //================================== REACT STATE COMPONENTS ========================================================

    componentDidMount() {
        const {columns, rows, pageConfig, toggleSelect, viewConfig, colReorder} = this.props;

        //Setting up the columns
        let gridColumns = columns.map(v => {
            return {name: v.replace(/\s/g, ""), title: v};
        });

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
            if (viewConfig === "search" || viewConfig === "allnosearch" || viewConfig === "all")
                viewSetup = viewConfig;
            else
                viewSetup = "simple";
        }

        let editingMode = false;

        this.setState({
            columns: gridColumns, rows: gridRows, columnOrder: columns, pageSize, pageSizes, selectionToggled,
            viewSetup, columnWidths, columnReordering, editingMode
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

            this.props.selectedValues(selectedRows)
        }
    }

    changeEditState() {
        const {viewSetup, editingMode} = this.state;

        if (viewSetup === "all" || viewSetup === "allnosearch")
            this.setState({editingMode: !editingMode});
    }

    //=========================================== RENDER ===============================================================
    render() {
        //Retrieving all state values
        const {
            rows, columns, sorting, columnWidths, pageSize, pageSizes, currentPage,
            selection, selectionToggled, viewSetup, columnReordering, columnOrder,
            editingMode
        } = this.state;

        //Enabling selection or not
        let selectionState;
        let integratedSelection;
        let tableSelection;
        if (selectionToggled && this.props.selectedValues !== undefined) {
            selectionState = <SelectionState
                selection={selection}
                onSelectionChange={this.changeSelection}
            />;
            integratedSelection = <IntegratedSelection/>;
            tableSelection = <TableSelection
                selectByRowClick
                showSelectAll
            />
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
        let btnAdd = <Button variant="success" style={{marginRight: 5, borderLeft: 0}}>
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
                selection={selection}
                onSelectionChange={this.changeSelection}
            />;
            integratedSelection = <IntegratedSelection/>;

            deleteSelected = <Button variant="danger">
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

        //Handling what appears in the menu bar based on viewConfig
        let menuOptions;
        if (viewSetup !== "simple") {
            if (viewSetup === "search") {
                menuOptions = <Form inline="true">
                    <Form.Group>
                        <Form.Control as="select"
                                      value="default"
                                      style={{fontSize: 12, marginRight: 5}}>
                            <option disabled value={"default"} key={0}>Select Column...</option>
                        </Form.Control>

                        <Form.Control style={{fontSize: 12, marginRight: 5}} type="text"
                                      placeholder="Search Value"/>
                    </Form.Group>

                    <Button variant="outline-dark" style={{marginRight: 5}}> <FaSearch/> </Button>
                    <Button variant="outline-dark"> <FaRedo/> </Button>
                </Form>;
            } else if (viewSetup === "allnosearch"){
                menuOptions = <Form inline="true">
                        {btnAdd} {btnEdit}
                </Form>;

            } else if (viewSetup === "all") {
                menuOptions = <Form inline="true">
                    <Form.Group>
                        {btnAdd} {btnEdit}

                        <Form.Control as="select"
                                      value="default"
                                      style={{fontSize: 12, marginRight: 5}}>
                            <option disabled value={"default"} key={0}>Select Column...</option>
                        </Form.Control>

                        <Form.Control style={{fontSize: 12, marginRight: 5}} type="text"
                                      placeholder="Search Value"/>
                    </Form.Group>

                    <Button variant="outline-dark" style={{marginRight: 5}}> <FaSearch/> </Button>
                    <Button variant="outline-dark"> <FaRedo/> </Button>
                </Form>;
            }
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
                            <Button variant="primary">
                                <FaSync/> Refresh
                            </Button>
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
                    {selectionState}

                    <SortingState
                        sorting={sorting}
                        onSortingChange={this.changeSorting}
                    />

                    <PagingState
                        currentPage={currentPage}
                        onCurrentPageChange={this.changeCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={this.changePageSize}
                    />

                    <EditingState/>

                    {dragDropProvider}
                    <IntegratedPaging/>
                    {integratedSelection}

                    <IntegratedSorting/>
                    <Table
                        tableComponent={TableComponent}
                    />

                    <TableEditRow/>
                    {options}
                    {multiSelect}

                    <TableColumnResizing
                        columnWidths={columnWidths}
                        onColumnWidthsChange={this.changeColumnWidths}
                    />

                    {tableColumnReordering}

                    <TableHeaderRow showSortingControls/>
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
