/*
Lord Mendoza - 4/16/19

The grid component takes a list of columns & generates a fully-featured grid that can be interacted
with by the user. Several functions are available such as sorting, paginating, adjusting column
widths, and adding/updating/deleting (including multi-delete)/searching/refreshing.

Contains the following props (required ones are indicated with (r))
1) (r) "columns" = takes an array of strings
	[
		"<name of column>", ...
	]

2) (r) "rows" = takes a Json array
	[
		{<name of corresponding column>: <column value>, <next column>: <column value>, ...},
		...
	]
Note: for proper sorting behavior, ensure to pass numbers as column value for number-typed columns, rather
than "10", or "11".

2) (r) "showControls" = takes a boolean
3) "defaultPageSize" = takes a number; set to 10 by default
4) "showSelectBtn" = takes a boolean; set to false by default
5) "pageSizes" = takes an array of numbers; set to [10, 50, 100] by default

Sample usage:
	<GridComponent columns={varJsonArray}
				   showControls=true
				   defaultPageSize=25
				   showSelectBtn=true
				   pageSizes=[25, 50, 100]
	   />
 */
//======================================================================================================================
//============================================= IMPORTS ================================================================

//React
import React, {Component} from 'react';
import './GridComponent.css';

//DevExpress Grid
import {
    Grid, PagingPanel,
    Table, TableColumnResizing,
    TableHeaderRow,
} from '@devexpress/dx-react-grid-bootstrap4';
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";
import {IntegratedPaging, IntegratedSorting, PagingState, SortingState} from "@devexpress/dx-react-grid";
import {Image, Nav, Navbar, NavDropdown} from "react-bootstrap";

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
            currentPage: 0
        };

        this.changeSorting = sorting => this.setState({sorting});
        this.changeColumnWidths = (columnWidths) => {this.setState({columnWidths})};
        this.changeCurrentPage = currentPage => this.setState({currentPage});
        this.changePageSize = pageSize => this.setState({pageSize});
    }

    componentDidMount() {
        const {columns, rows, pageSizing} = this.props;

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

        this.setState({columns: gridColumns, rows: gridRows, pageSize, pageSizes});
    }

    componentDidUpdate(prevProps) {
        if (this.props.columns !== prevProps.columns || this.props.rows !== prevProps.rows) {
            const {columns, rows, pageSizing} = this.props;

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

            this.setState({columns: gridColumns, rows: gridRows, pageSize, pageSizes});
        }
    }

    render() {
        const {rows, columns, sorting, columnWidths, pageSize, pageSizes, currentPage} = this.state;

        return (
            <div style={{fontSize: '12px'}}>

                {/*=============================== Nav Bar Portion ===============================*/}

                <Navbar variant="light">
                    <Nav className="mr-auto">
                        <Nav.Link> <Image src="reset.png"/> Reset </Nav.Link>
                        <Nav.Link> <Image src="search.png"/> Search </Nav.Link>

                        <NavDropdown title={<div className="pull-left">
                            <Image src="actions.png"/> Actions
                        </div>}>
                            <NavDropdown.Item>
                                <Image src="edit.png"/> Edit
                            </NavDropdown.Item>

                            <NavDropdown.Item>
                                <Image src="reject.png"/> Delete
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar>

                {/*=============================== Grid Portion ===============================*/}
                <Grid
                    rows={rows}
                    columns={columns}
                >
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

                    <PagingPanel
                        pageSizes={pageSizes}
                    />
                </Grid>

            </div>
        );
    }
}

export default GridComponent;
