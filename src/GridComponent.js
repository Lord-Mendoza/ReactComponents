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
    IntegratedPaging, IntegratedSelection,
    IntegratedSorting,
    PagingState,
    SelectionState,
    SortingState
} from "@devexpress/dx-react-grid";
import {
    Grid, PagingPanel, DragDropProvider,
    Table, TableColumnResizing,
    TableHeaderRow, TableSelection, TableColumnReordering,
} from '@devexpress/dx-react-grid-bootstrap4';
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";

import {
    Button,
    Col,
    Container, Form,
    Image,
    Row
} from "react-bootstrap";
import {FaPlus, FaRedo, FaSearch, FaSlidersH, FaSync} from "react-icons/fa";


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
        this.changeColumnWidths = (columnWidths) => {this.setState({columnWidths})};
        this.changeCurrentPage = currentPage => this.setState({currentPage});
        this.changePageSize = pageSize => this.setState({pageSize});
        this.changeSelection = selection => {this.setState({selection}, this.handleSelectedValues)};
        this.changeColumnOrder = (newOrder) => {this.setState({columnOrder: newOrder})};

        //Helper functions of this component
        this.handleSelectedValues = this.handleSelectedValues.bind(this);
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
            if (viewConfig === "search")
                viewSetup = "search";
            else if (viewConfig === "all")
                viewSetup = "all";
            else
                viewSetup = "simple";
        }

        this.setState({
            columns: gridColumns, rows: gridRows, columnOrder: columns, pageSize, pageSizes, selectionToggled,
            viewSetup, columnWidths, columnReordering
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.columns !== prevProps.columns || this.props.rows !== prevProps.rows) {

        }
    }

    //==================================================================================================================
    //====================== HELPER FUNCTIONS FOR PASSING DATA TO PARENT COMPONENT =====================================

    handleSelectedValues() {
        if (this.props.selectedValues !== undefined){
            const {selection} = this.state;

            this.props.selectedValues(selection)
        }
    }

    //=========================================== RENDER ===============================================================
    render() {
        const {
            rows, columns, sorting, columnWidths, pageSize, pageSizes, currentPage,
            selection, selectionToggled, viewSetup, columnReordering, columnOrder
        } = this.state;

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

        let dragDropProvider;
        let tableColumnReordering;
        if (columnReordering)
        {
            dragDropProvider = <DragDropProvider/>;
            tableColumnReordering = <TableColumnReordering
                                        order = {columnOrder}
                                        onOrderChange={this.changeColumnOrder} />;
        }


        let menuOptions;
        let btnAdd = <Button variant="success" style={{marginRight: 5, borderLeft: 0}}>
            <FaPlus/> Create Entry
        </Button>;

        let btnEdit = <Button variant="info" style={{marginRight: 15, borderLeft: 0}}>
            <FaSlidersH/> Show Edit/Delete
        </Button>;

        if (viewSetup !== "simple") {
            if (viewSetup === "search"){
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
            }
            else if (viewSetup === "all") {
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

                    {dragDropProvider}
                    <IntegratedPaging/>
                    {integratedSelection}

                    <IntegratedSorting/>
                    <Table
                        tableComponent={TableComponent}
                    />

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
