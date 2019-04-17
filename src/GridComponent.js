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
import {
    Button,
    ButtonToolbar,
    Col,
    Container,
    Dropdown,
    Form,
    Image,
    OverlayTrigger,
    Popover,
    Row
} from "react-bootstrap";
import {FaRedo, FaSearch} from "react-icons/fa";

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

                <Container fluid={true} style={{marginRight: 1}}>
                    <Row noGutters={true}>
                        <Col>
                            <Form inline="true">
                                <Form.Group>
                                    {/*<Button variant="light" style ={{marginRight: 5, borderLeft: 0}}>
                                        <Image src='./add.png' /> Create
                                    </Button>*/}

                                    {/*<Button variant="light" style ={{marginRight: 5, borderLeft: 0}}>
                                        <Image src='./actions.png' /> Actions
                                    </Button>*/}
                                    <Dropdown>
                                        <Dropdown.Toggle variant="light" >
                                            <Image src='./actions.png' /> Actions
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item><Image src='./add.png'/> Create </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item><Image src='./edit.png'/> Edit </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item><Image src='./reject.png'/> Delete </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    <Form.Control as="select" className="Search" style={{fontSize: 12, marginLeft: 10}}
                                                  value="default">
                                        <option disabled value = {"default"} key={0}>Select Column...</option>
                                    </Form.Control>

                                    <Form.Control type="text" placeholder="Search Value" style={{fontSize: 12}}/>
                                </Form.Group>

                                <Button variant="outline-dark"> <FaSearch/> </Button>
                                <Button variant="outline-dark"> <FaRedo/> </Button>
                            </Form>
                        </Col>

                        <Col style={{float: 'right', textAlign: 'right', marginRight: '0px'}}>
                            <Button variant="light">
                                <Image src='./reset.png'/> Refresh
                            </Button>
                        </Col>
                    </Row>

                    {/*<Row noGutters={true}>
                        <Button variant="danger">
                            Delete Selected
                        </Button>

                        <ButtonToolbar>
                            <OverlayTrigger trigger="hover" key="right" placement="right"
                                            overlay={
                                                <Popover id={`popover-position-right`}
                                                         title={`Hint`}>

                                                    To make selection(s), either click on the checkbox or directly
                                                    on the row.
                                                </Popover>
                                            }
                            >

                                <Button variant="light"> ? </Button>

                            </OverlayTrigger>
                        </ButtonToolbar>
                    </Row>*/}
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
