/*
Lord Mendoza - 4/16/19

The grid component takes a list of columns & generates a fully-featured grid that can be interacted with by the user.
Several functions are available such as sorting, paginating, adjusting column widths, and adding/updating/deleting
(including multi-delete)/searching/refreshing.
-------
Pre-requisites:
*Include the following dependencies your package.json:
	"@devexpress/dx-react-core": "^1.10.1",
    "@devexpress/dx-react-grid": "^1.10.1",
    "@devexpress/dx-react-grid-bootstrap4": "^1.10.5",
    "bootstrap": "^4.3.1",
*Include the following in your index.js
	import 'bootstrap/dist/css/bootstrap.min.css';
*Wherever you're using this component, include:
	import GridComponent from "./GridComponent";
-------
Contains the following props (required ones are indicated with (r))
1) (r) "columns" = takes an array of strings
	[
		"<name of column>", ...
	]

2) (r) "rows" = takes a Json array
	[
		{<name of column>: <column value>, <next column>: <column value>, ...},
		...
	]
Note: for proper sorting behavior, ensure to pass numbers as column value for number-typed columns, rather than "10" or "11".

3) "pageSizing" = takes an array composed of two values:
	i. the default page size set
	ii. the page size options

4) "toggleSelect" = takes a boolean; set to false by default
5) "showControls" = takes a boolean; set to false by default

Sample usage:
	<GridComponent columns={varJsonArray}
				   rows={varJsonArray}
				   pageSizing=[25, [25, 50, 100]]
				   toggleSelect={true}
				   showControls={true}
	   />
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
    Grid, PagingPanel,
    Table, TableColumnResizing,
    TableHeaderRow, TableSelection,
} from '@devexpress/dx-react-grid-bootstrap4';
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";

import {
    Button,
    Col,
    Container,
    Image,
    Row
} from "react-bootstrap";
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

        this.changeSorting = sorting => this.setState({sorting});
        this.changeColumnWidths = (columnWidths) => {this.setState({columnWidths})};
        this.changeCurrentPage = currentPage => this.setState({currentPage});
        this.changePageSize = pageSize => this.setState({pageSize});
        this.changeSelection = selection => this.setState({selection});
    }

    //==================================================================================================================
    //================================== REACT STATE COMPONENTS ========================================================

    componentDidMount() {
        const {columns, rows, pageSizing, toggleSelect} = this.props;

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
        if (pageSizing !== undefined) {
            if (pageSizing.length === 2) {
                pageSize = pageSizing[0];
                pageSizes = pageSizing[1];
            }
        }

        //Setting up selection state if its enabled or not
        let selectionToggled = false;
        if (toggleSelect !== undefined) {
            if (toggleSelect)
                selectionToggled = toggleSelect;
        }

        this.setState({columns: gridColumns, rows: gridRows, pageSize, pageSizes, selectionToggled});
    }

    componentDidUpdate(prevProps) {
        if (this.props.columns !== prevProps.columns || this.props.rows !== prevProps.rows) {
            const {columns, rows, pageSizing, toggleSelect} = this.props;

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
            if (pageSizing !== undefined) {
                if (pageSizing.length === 2) {
                    pageSize = pageSizing[0];
                    pageSizes = pageSizing[1];
                }
            }

            //Setting up selection state if its enabled or not
            let selectionToggled = false;
            if (toggleSelect !== undefined) {
                if (toggleSelect)
                    selectionToggled = toggleSelect;
            }

            this.setState({columns: gridColumns, rows: gridRows, pageSize, pageSizes, selectionToggled});
        }
    }

    //=========================================== RENDER ===============================================================
    render() {
        const {rows, columns, sorting, columnWidths, pageSize, pageSizes, currentPage,
            selection, selectionToggled} = this.state;

        let selectionState;
        let integratedSelection;
        let tableSelection;
        if (selectionToggled) {
            selectionState = <SelectionState
                selection={selection}
                onSelectionChange={this.changeSelection}
            />;
            integratedSelection = <IntegratedSelection />;
            tableSelection = <TableSelection
                selectByRowClick
                showSelectAll
            />
        }


        return (
            <div style={{fontSize: '12px'}}>

                {/*=============================== Nav Bar Portion ===============================*/}

                <Container fluid={true} style={{marginRight: 1}}>
                    <Row noGutters={true}>
                        <Col>
                            <b style={{paddingRight: 50, paddingLeft: 5, verticalAlign: 'middle', fontSize: 15}}>
                                Title
                            </b>

                            <Button variant="light" style ={{marginRight: 5, borderLeft: 0}}>
                                <Image src='./add.png'/> Create
                            </Button>

                            <Button variant="light" style ={{marginRight: 5, borderLeft: 0}}>
                                <Image src='./edit.png'/> Edit
                            </Button>

                            <Button variant="light" style ={{marginRight: 5, borderLeft: 0}}>
                                <Image src='./reject.png'/> Delete
                            </Button>
                        </Col>

                        <Col style={{float: 'right', textAlign: 'right', marginRight: '0px'}}>
                            <Button variant="light">
                                <Image src='./reset.png'/> Refresh
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

                    {integratedSelection}
                    <IntegratedPaging/>
                    <IntegratedSorting/>
                    <Table
                        tableComponent={TableComponent}
                    />

                    <TableColumnResizing
                        columnWidths={columnWidths}
                        onColumnWidthsChange={this.changeColumnWidths}
                    />

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
