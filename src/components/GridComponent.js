/*
Lord Mendoza - 4/19/19
 */
//======================================================================================================================
//============================================= IMPORTS ================================================================

//React
import React from 'react';
import PropTypes from 'prop-types';
import '../styling/GridComponent.css';
//DevExpress Grid
import {
    CustomPaging,
    CustomSummary,
    DataTypeProvider,
    EditingState,
    FilteringState,
    GroupingState,
    IntegratedFiltering,
    IntegratedGrouping,
    IntegratedPaging,
    IntegratedSelection,
    IntegratedSorting,
    IntegratedSummary,
    PagingState,
    RowDetailState,
    SelectionState,
    SortingState,
    SummaryState
} from "@devexpress/dx-react-grid";
import {
    DragDropProvider,
    Grid,
    PagingPanel,
    Table,
    TableColumnReordering,
    TableColumnResizing,
    TableColumnVisibility,
    TableEditColumn,
    TableEditRow,
    TableGroupRow,
    TableHeaderRow,
    TableRowDetail,
    TableSelection,
    TableSummaryRow,
} from '@devexpress/dx-react-grid-bootstrap4';
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";
//React-Bootstrap
import {Button, ButtonToolbar, Col, Container, Form, OverlayTrigger, Popover, Row} from "react-bootstrap";
import {FaPlus, FaQuestion, FaRedo, FaSearch, FaSlidersH, FaSync, FaTrash} from "react-icons/fa";


//======================================================================================================================
//================================= GLOBAL VARIABLE FOR GRID CONFIGURATION =============================================

const TableComponent = ({...restProps}) => (
    <Table.Table
        {...restProps}
        className="table-striped"
    />
);

const GroupCellContent = ({row}) => (
    <span>
        <b>
            {row.value}
        </b>
    </span>
);

//======================================================================================================================
//=========================================== START OF CLASS ===========================================================

class GridComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        let filterByColumnEnabled;
        if (props.hasOwnProperty("filterByColumnEnabled"))
            filterByColumnEnabled = props["filterByColumnEnabled"];

        let tableCell;
        if (props.hasOwnProperty("tableCell"))
            tableCell = props["tableCell"];

        let tableColumnExtensions;
        if (props.hasOwnProperty("tableColumnExtensions"))
            tableColumnExtensions = props["tableColumnExtensions"];

        let gridSorting;
        if (props.hasOwnProperty("gridSorting"))
            gridSorting = props["gridSorting"];

        let summaryItems;
        if (props.hasOwnProperty("summaryItemsEnabled") && props.hasOwnProperty("summaryItems") ) {
            summaryItems = props["summaryItems"];
        }

        let summaryValue;
        if (props.hasOwnProperty("summaryIsCustomized") && props.hasOwnProperty("summaryValue")) {
            summaryValue = props["summaryValue"];
        }

        let editExternally;
        if (props.hasOwnProperty("editExternally") && props.hasOwnProperty("editToggled"))
            editExternally = props["editExternally"];

        let sortingColumnExtensions;
        if (props.hasOwnProperty("sortingColumnExtensions"))
            sortingColumnExtensions = props["sortingColumnExtensions"];

        let hiddenColumns;
        if (props.hasOwnProperty("hiddenColumns") && props["hiddenColumns"]) {
            hiddenColumns = props["hiddenColumns"];
        }

        let buttonColors;
        if (props.hasOwnProperty("buttonColors") && props["buttonColors"])
            buttonColors = props["buttonColors"];

        let disableModifications;
        if (props.hasOwnProperty("disableModifications") && props["disableModifications"])
            disableModifications = props["disableModifications"];

        let remoteSortingToggled = false;
        if (props.hasOwnProperty("remoteSorting") && props["remoteSorting"] === true) {
            remoteSortingToggled = true;
        }

        let gridContainerClass;
        if (props.hasOwnProperty("gridContainerClass") && props["gridContainerClass"]) {
            gridContainerClass = props["gridContainerClass"];
        }

        let editAlways;
        if (props.hasOwnProperty("editAlways") && props["editAlways"]) {
            editAlways = props["editAlways"];
        }

        let showPagingPanel = true;
        if (props.hasOwnProperty("showPagingPanel") && props["showPagingPanel"] === false) {
            showPagingPanel = false;
        }

        let rowDetailsEnabled = false, rowDetailsContent;
        if (props.hasOwnProperty("rowDetailsEnabled") && props["rowDetailsEnabled"] === true
            && props.hasOwnProperty("rowDetailsContent")
            && props["rowDetailsContent"] !== undefined && props["rowDetailsContent"] !== null) {
            rowDetailsEnabled = true;
            rowDetailsContent = props["rowDetailsContent"];
        }

        let toggleEditDeleteExternally;
        if (props.hasOwnProperty("toggleEditDeleteExternally"))
            toggleEditDeleteExternally = props["toggleEditDeleteExternally"];

        let showEditDelete;
        if (toggleEditDeleteExternally && props.hasOwnProperty("showEditDelete")) {
            showEditDelete = props["showEditDelete"];
        }

        let showSelectTooltip = true;
        if (props.hasOwnProperty("showSelectTooltip") && props["showSelectTooltip"] === false)
            showSelectTooltip = false;

        let deleteExternally = false;
        if (props.hasOwnProperty("deleteExternally") && props["deleteExternally"] === true)
            deleteExternally = true;

        let hideColumnName = false;
        if (props.hasOwnProperty("hideColumnName") && props["hideColumnName"] === true)
            hideColumnName = true;

        let showGroupCount = false;
        if (props.hasOwnProperty("showGroupCount") && props["showGroupCount"] === true)
            showGroupCount = true;

        let allowSelectAll = false;
        if (props.hasOwnProperty("allowSelectAll") && props["allowSelectAll"] === true)
            allowSelectAll = true;

        //-------------------------------------- STATE VALUES ----------------------------------------------------------
        this.state = {
            //Required for rendering data in the grid
            columns: [],
            rows: [],

            //Custom Configurations
            columnLabels: [],
            colWidths: [],
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

            summaryItems,
            summaryValue,

            editExternally,
            remoteSortingToggled,

            toggleEditDeleteExternally,
            showEditDelete,

            filterByColumnEnabled,
            tableCell,
            tableColumnExtensions,
            gridSorting,
            sortingColumnExtensions,
            hiddenColumns,
            buttonColors,
            disableModifications,
            gridContainerClass,
            editAlways,
            showPagingPanel,
            showSelectTooltip,
            deleteExternally,
            hideColumnName,
            showGroupCount,
            allowSelectAll,
            rowDetailsEnabled,
            rowDetailsContent
        };

        //In-line methods that is better to be declared here rather than outside the constructor (since its simple)
        this.changeColumnWidths = (colWidths) => {
            this.setState({colWidths})
        };
        this.changeSelection = selection => {
            this.setState({selection}, this.handleSelectedValues)
        };
        this.changeDeletionSelection = (selection, shouldPassSelectedValues) => {
            if (shouldPassSelectedValues)
                this.setState({deletionSelection: selection}, () => this.changeSelection(selection))
            else
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
        this.changeSorting = this.changeSorting.bind(this);
        this.changeEditState = this.changeEditState.bind(this);
        this.editEntry = this.editEntry.bind(this);
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
            blockedSearchColumns, remotePaging, currentPage, currentPageSize, totalCount,
            columnWidths, hideOnSubmit
        } = this.props;
        const {
            editingMode
        } = this.state;

        //Setting up column labels to be used later by search component
        let columnLabels = columns;

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
        let colWidths = columns.map(v => {
            if (columnWidths && columnWidths.hasOwnProperty(v["name"]))
                return {columnName: v["name"], width: columnWidths[v["name"]]};
            else
                return {columnName: v["name"], width: 180};
        });

        //Checking if the developer opted to allow column reordering
        let columnReordering = false;
        if (colReorder)
            columnReordering = true;

        //Checking which viewSetup the developer went with. Consult the wiki for more details on the individual
        //options.
        let viewSetup = "bare";
        if (viewConfig !== undefined) {
            if (["bare", "simple", "search", "all", "allnosearch"].includes(viewConfig))
                viewSetup = viewConfig;
            else
                viewSetup = "bare";
        }

        //Configuring certain columns to not be editable based on the developer's choice.
        let nonEditableColumns = [];
        if (blockedColumns !== undefined) {
            if (blockedColumns.length > 0) {
                blockedColumns.forEach(v => {
                    nonEditableColumns.push({columnName: v.replace(/\s/g, "").replace(/[\W_]+/g,""), editingEnabled: false});
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

        let groupBy, groupsExpanded;
        if (this.props.hasOwnProperty("groupBy"))
            groupBy = this.props["groupBy"];
        if (this.props.hasOwnProperty("groupsExpanded") && this.props["groupsExpanded"])
            groupsExpanded = this.props["groupsExpanded"];

        let newEditingMode;
        if (hideOnSubmit === "false" || hideOnSubmit === false) {
            newEditingMode = editingMode;
        } else {
            newEditingMode = false;
        }

        this.setState({
            //Required values for rendering the grid
            columns, rows,

            //Additional grid configurations
            columnLabels, columnOrder: columns,
            colWidths, columnReordering,
            pageSize, pageSizes,
            selectionToggled,
            editingMode: newEditingMode,

            //Tracking which grid view the developer opted for
            viewSetup,

            //Tracking which rows are deleted/edited/search to be passed back to parent component
            deletionSelection: [], editingRowIds: [], rowChanges: [],

            //Configuring the search component
            editingStateColumnExtensions: nonEditableColumns, nonSearchableColumns,

            groupBy, groupsExpanded,

            //Remote paging configuration
            remotePagingToggled, totalDataCount,
        }, () => {
            if (this.props.hasOwnProperty("disableExternalDeleteButton")) {
                this.props.disableExternalDeleteButton(false);
            }
        });
    }

    /*
    If changes occur in the parent component involving the required sections of the grid
    (new data is loaded, new columns) then the GridComponent's state is re-initialized again
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.columns !== prevProps.columns || this.props.rows !== prevProps.rows || (this.props.filterByColumnEnabled && this.props.filterArray !== prevProps.filterArray)
            || (this.props.gridSorting !== prevProps.gridSorting)
            || (this.props.summaryItemsEnabled && (JSON.stringify(this.props.summaryItems) !== JSON.stringify(prevProps.summaryItems) || this.props.summaryValue !== prevProps.summaryValue) ) ) {
            const {
                columns, rows, pageConfig, toggleSelect, viewConfig, colReorder, blockedColumns,
                blockedSearchColumns, remotePaging, currentPage, currentPageSize, totalCount,
                columnWidths, gridSorting, hideOnSubmit, groupsExpanded, groupBy
            } = this.props;
            const {
                editingMode
            } = this.state;

            //Setting up column labels to be used later by search component
            let columnLabels = columns;

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
            let colWidths = columns.map(v => {
                if (columnWidths && columnWidths.hasOwnProperty(v["name"]))
                    return {columnName: v["name"], width: columnWidths[v["name"]]};
                else
                    return {columnName: v["name"], width: 180};
            });

            //Checking if the developer opted to allow column reordering
            let columnReordering = false;
            if (colReorder)
                columnReordering = true;

            //Checking which viewSetup the developer went with. Consult the wiki for more details on the individual
            //options.
            let viewSetup = "bare";
            if (viewConfig !== undefined) {
                if (["bare", "simple", "search", "all", "allnosearch"].includes(viewConfig))
                    viewSetup = viewConfig;
                else
                    viewSetup = "bare";
            }

            //Configuring certain columns to not be editable based on the developer's choice.
            let nonEditableColumns = [];
            if (blockedColumns !== undefined) {
                if (blockedColumns.length > 0) {
                    blockedColumns.forEach(v => {
                        nonEditableColumns.push({columnName: v.replace(/\s/g, "").replace(/[\W_]+/g,""), editingEnabled: false});
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

            //Retrieving the search value as the user types
            let filterArray;
            if (this.props.filterArray)
                filterArray = this.props.filterArray;
            else
                filterArray = [];

            let summaryItems = [];
            if (this.props.summaryItems)
                summaryItems = this.props.summaryItems;

            let summaryValue = 0;
            if (this.props.summaryValue)
                summaryValue = this.props.summaryValue;

            let newEditingMode;
            if (hideOnSubmit === "false" || hideOnSubmit === false) {
                newEditingMode = editingMode;
            } else {
                newEditingMode = false;
            }

            let callbackFunction;
            if (this.props.hasOwnProperty("selectionsWereReset"))
                callbackFunction = () => this.props["selectionsWereReset"](true);

            let groupKeyArray;
            if (groupsExpanded && rows) {
                groupKeyArray = [];
                for (let i = 0; i < rows.length; i++) {
                    if (!groupKeyArray.includes(rows[i][groupBy])) {
                        groupKeyArray.push(rows[i][groupBy]);
                    }
                }
            }

            this.setState({
                //Required values for rendering the grid
                columns, rows,

                //Additional grid configurations
                columnLabels, columnOrder: columns,
                colWidths, columnReordering,
                pageSize, pageSizes,
                selectionToggled, gridSorting,
                editingMode: newEditingMode,
                currentPage: currentPage,
                currentPageSize: currentPageSize,

                //Tracking which grid view the developer opted for
                viewSetup,

                //Tracking which rows are deleted/edited/search to be passed back to parent component
                deletionSelection: [], editingRowIds: [], rowChanges: [],
                filterArray,

                summaryItems, summaryValue,

                //Grouping
                groupKeyArray,

                //Cleaning up selections again
                selection: [],

                //Configuring the search component
                editingStateColumnExtensions: nonEditableColumns, nonSearchableColumns,

                //Remote paging configuration
                remotePagingToggled, totalDataCount,
            }, callbackFunction);
        } else if (this.props.hasOwnProperty("toggleSelect") && this.props.toggleSelect !== prevProps.toggleSelect) {
            this.setState({selectionToggled: this.props.toggleSelect});
        } else if (this.props.hasOwnProperty("selectionsWereReset") && this.props.resetSelections !== prevProps.resetSelections) {
            if (this.props["resetSelections"])
                this.setState({selections: []}, () => this.props["selectionsWereReset"](true));
        } else if (this.props.hasOwnProperty("remotePaging") && this.props.remotePaging === true
            && (this.props.currentPage !== prevProps.currentPage || this.props.pageSize !== prevProps.pageSize)) {
            if (this.props.currentPage !== prevProps.currentPage) {
                this.setState({currentPage: this.props.currentPage});
            } else if (this.props.pageSize !== prevProps.pageSize) {
                this.setState({pageSize: this.props.pageSize});
            }
        } else if (this.props.hasOwnProperty("clearDeletedRows")
            && this.props.clearDeletedRows !== prevProps.clearDeletedRows && this.props.clearDeletedRows) {
            this.setState({deletionSelection: []})
        } else if (this.props.hasOwnProperty("resetSearch") && this.props.hasOwnProperty("revertResetSearch")
            && this.props.resetSearch !== prevProps.resetSearch && this.props.resetSearch === true) {
            this.props.revertResetSearch();
            this.setState({
                searchValue: "",
                searchColumn: "default"
            });
        } else if (this.props.hasOwnProperty("disableModifications")
            && this.props.disableModifications !== prevProps.disableModifications
            && this.props.disableModifications) {

            this.setState({
                disableModifications: this.props.disableModifications
            });
        }

        if (this.props.hasOwnProperty("columnWidths") && prevProps.hasOwnProperty("columnWidths")
            && this.props.columnWidths !== prevProps.columnWidths
            && Array.isArray(this.props.columnWidths) && this.props.columnWidths.length > 0) {
            const {columns, columnWidths} = this.props;

            let colWidths = columns.map(v => {
                if (columnWidths && columnWidths.hasOwnProperty(v))
                    return {columnName: v, width: columnWidths[v]};
                else
                    return {columnName: v, width: 180};
            });

            this.setState({
                colWidths
            })
        }

        if (this.state.toggleEditDeleteExternally === true &&
            this.props.hasOwnProperty("showEditDelete") && prevProps.hasOwnProperty("showEditDelete") && this.props["showEditDelete"] !== prevProps["showEditDelete"]) {

            this.setState({
                showEditDelete: this.props["showEditDelete"]
            })
        }

        if (this.state.deleteExternally === true && this.props.hasOwnProperty("deletedValues") &&
            this.props.hasOwnProperty("getDeletedValues") && prevProps.hasOwnProperty("getDeletedValues") && this.props["getDeletedValues"] !== prevProps["getDeletedValues"]) {

            if (this.props["getDeletedValues"] === true)
                this.deleteSelected();
        }

        if (this.state.deletionSelection !== prevState.deletionSelection && this.props.hasOwnProperty("disableExternalDeleteButton")) {
            if (Array.isArray(this.state.deletionSelection) && this.state.deletionSelection.length > 0)
                this.props.disableExternalDeleteButton(false);
            else {
                this.props.disableExternalDeleteButton(true);
            }
        }

        if (prevProps["tableCell"] !== this.props["tableCell"] && this.props["tableCell"]) {
            this.setState({tableCell: this.props["tableCell"]});
        }

        if (prevProps["rowDetailsEnabled"] !== this.props["rowDetailsEnabled"]) {
            this.setState({rowDetailsEnabled: this.props["rowDetailsEnabled"], rowDetailsContent: this.props["rowDetailsContent"]})
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        for (let prop in nextProps) {
            if (Array.isArray(nextProps[prop]) && Array.isArray(this.props[prop])) {
                if (this.arraysNotEqual(nextProps[prop], this.props[prop]))
                    return true;
            } else if (typeof nextProps[prop] === "object" && typeof this.props[prop] === "object") {
                if (this.objectsNotEqual(nextProps[prop], this.props[prop]))
                    return true;
            } else if (typeof nextProps[prop] !== typeof this.props[prop]) {
                return true;
            } else if (typeof nextProps[prop] !== "function" && typeof this.props[prop] !== "function"
                && nextProps[prop] !== this.props[prop]) {
                return true;
            }
        }

        for (let prop in nextState) {
            if (Array.isArray(nextState[prop]) && Array.isArray(this.state[prop])) {
                if (this.arraysNotEqual(nextState[prop], this.state[prop]))
                    return true;
            } else if (typeof nextState[prop] === "object" && typeof this.state[prop] === "object") {
                if (this.objectsNotEqual(nextState[prop], this.state[prop]))
                    return true;
            } else if (typeof nextState[prop] !== typeof this.state[prop]) {
                return true;
            } else if (typeof nextState[prop] !== "function" && typeof this.state[prop] !== "function"
                && nextState[prop] !== this.state[prop]) {
                return true;
            }
        }

        return false;
    }

    objectsNotEqual(objOne, objTwo) {
        let objString = JSON.stringify(objOne, Object.keys(objOne).sort());
        let currentObjString = JSON.stringify(objTwo, Object.keys(objTwo).sort());

        if (objString !== currentObjString)
            return true;
        else
            return false;
    }

    arraysNotEqual(arrayOne, arrayTwo) {
        if (arrayOne.length !== arrayTwo.length)
            return true;
        else {
            for (let i = 0; i < arrayOne.length; i++) {
                if (typeof arrayOne[i] === "object" && typeof arrayTwo[i] === "object") {
                    if (this.objectsNotEqual(arrayOne[i], arrayTwo[i]))
                        return true;
                } else if (typeof arrayOne[i] !== typeof arrayTwo[i])
                    return true;
                else if (arrayOne[i] !== arrayTwo[i])
                    return true;
            }
            return false;
        }
    }

    //==================================================================================================================
    //====================== HELPER FUNCTIONS FOR PASSING DATA TO PARENT COMPONENT =====================================

    changeSorting(sorting) {
        const {remoteSortingToggled} = this.state;

        if (remoteSortingToggled === true) {
            this.props.selectedSorting(sorting);
            this.setState({sorting, gridSorting: undefined})
        } else {
            this.setState({sorting, gridSorting: undefined})
        }
    }

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

            if (searchValue && searchColumn && searchColumn !== "default") {
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
    Triggering the callback for clicking the edit button on a row when editExternally prop is set to true.

    Note that GridComponent will NOT handle the data creation. You can choose to handle this creation phase as
    you desire, whether you'll respond with a modal that includes the form or however else you wish.
    */
    editEntry(rowIndex) {
        const {rows} = this.state
        const {editExternally, editToggled} = this.props;

        if (editExternally && editToggled) {
            this.setState({editingRowIds: []}, () => editToggled(rows[rowIndex], rowIndex));
        }
    }

    /*
    Changes the page based on user interaction

    If remotePaging is toggled to true, then the current page value is sent back to the parent prop.
    */
    changeCurrentPage = currentPage => {
        if (this.state.remotePagingToggled)
            this.props.changeCurrentPage(currentPage);
        else
            this.setState({currentPage});
    };

    /*
    Changes the page size based on user interaction

    If remotePaging is toggled to true, then the current page size value is sent back to the parent prop.
    */
    changePageSize = pageSize => {
        if (this.state.remotePagingToggled)
            this.props.changeCurrentPageSize(pageSize);
        else
            this.setState({pageSize});
    };

    //=========================================== RENDER ===============================================================
    render() {
        //Retrieving all state values
        const {
            rows, columns, columnLabels, sorting, colWidths, pageSize, pageSizes, currentPage,
            selection, selectionToggled, viewSetup, columnReordering, columnOrder, editingMode,
            deletionSelection, nonSearchableColumns, totalDataCount, filterByColumnEnabled, filterArray,
            tableCell, tableColumnExtensions, gridSorting, summaryItems, summaryValue, groupBy, groupsExpanded,
            sortingColumnExtensions, hiddenColumns, buttonColors, editExternally, disableModifications,
            remoteSortingToggled, gridContainerClass, groupKeyArray, showPagingPanel,
            toggleEditDeleteExternally, showEditDelete, showSelectTooltip, deleteExternally,
            hideColumnName, showGroupCount, allowSelectAll, editAlways, rowDetailsEnabled, rowDetailsContent
        } = this.state;

        //Determining whether to display the select checkboxes to the left of the rows or not
        //Note that this checks if the viewSetup is set to bare, simple, or search. If its neither
        //of those three, then this won't be rendered (since checkboxes will appear already for
        //delete/edit mode)
        let selectionState;
        let integratedSelection;
        let tableSelection;
        if (selectionToggled && this.props.selectedValues !== undefined &&
            !deleteExternally && (viewSetup === "simple" || viewSetup === "search" || viewSetup === "bare")) {
            selectionState = Array.isArray(rows) && rows.length > 0 && <SelectionState
                selection={selection}
                onSelectionChange={this.changeSelection}
            />;
            integratedSelection = Array.isArray(rows) && rows.length > 0 && <IntegratedSelection/>;
            tableSelection = Array.isArray(rows) && rows.length > 0 && <TableSelection
                selectByRowClick={true}
                showSelectionColumn={true}
                showSelectAll={allowSelectAll}
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

        let createStyle = {marginRight: 5, borderLeft: 0};
        let editStyle = {marginRight: 15, borderLeft: 0};
        let refreshStyle = {};
        let deleteStyle = {};
        let createVariant = "success", editVariant = "info", deleteVariant = "danger", refreshVariant = "primary";
        if (buttonColors) {
            if (typeof buttonColors === "object") {
                const {
                    createColor, editColor, deleteColor, refreshColor,
                    createTextColor, editTextColor, deleteTextColor, refreshTextColor
                } = buttonColors;

                if (createColor)
                    createStyle["backgroundColor"] = createColor;
                if (createTextColor)
                    createStyle["color"] = createTextColor;

                if (editColor)
                    editStyle["backgroundColor"] = editColor;
                if (editTextColor)
                    editStyle["color"] = editTextColor;

                if (deleteColor)
                    deleteStyle["backgroundColor"] = deleteColor;
                if (deleteTextColor)
                    deleteStyle["color"] = deleteTextColor;

                if (refreshColor)
                    refreshStyle["backgroundColor"] = refreshColor;
                if (refreshTextColor)
                    refreshStyle["color"] = refreshTextColor;

                createVariant = "";
                editVariant = "";
                deleteVariant = "";
                refreshVariant = "";
            } else if (typeof buttonColors === "string" && buttonColors === "muted") {
                createVariant = "secondary";
                editVariant = "secondary";
                deleteVariant = "secondary";
                refreshVariant = "secondary";
            }
        }

        let isModDisabled = false;
        if ((disableModifications !== null || disableModifications !== undefined) && disableModifications === true) {
            isModDisabled = true;
            createStyle["cursor"] = "default";
            editStyle["cursor"] = "default";
            deleteStyle["cursor"] = "default";
        }

        //Declaring the add button
        let btnAdd = <Button variant={createVariant} style={createStyle}
                             disabled={isModDisabled}
                             onClick={this.createEntry}>
            <FaPlus/> Create Entry
        </Button>;

        let editingConfig = editingMode;
        if (toggleEditDeleteExternally === true && typeof showEditDelete === "boolean") {
            editingConfig = showEditDelete;
        }

        //Declaring the Show/Hide Edit/Delete button based on editing state
        let btnEdit, options, multiSelect, deleteSelected, deleteHint;
        if ( ( (viewSetup === "all" || viewSetup === "allnosearch") || toggleEditDeleteExternally) && !editingConfig) {
            btnEdit = <Button variant={editVariant} style={editStyle}
                              disabled={isModDisabled}
                              onClick={this.changeEditState}>
                <FaSlidersH/> Show Edit/Delete
            </Button>;
            options = Array.isArray(rows) && rows.length > 0 && <TableEditColumn width={0}/>;
        } else if ( ( (viewSetup === "all" || viewSetup === "allnosearch") || toggleEditDeleteExternally ) && editingConfig) {
            btnEdit = <Button variant={editVariant} style={editStyle}
                              disabled={isModDisabled}
                              onClick={this.changeEditState}>
                <FaSlidersH/> Hide Edit/Delete
            </Button>;

            options = Array.isArray(rows) && rows.length > 0 && <TableEditColumn showEditCommand width='50px'/>;
            multiSelect = Array.isArray(rows) && rows.length > 0 && <TableSelection selectByRowClick={true} showSelectionColumn={true} showSelectAll={allowSelectAll}/>;

            let selectionToggledShouldPassSelectedValues = selectionToggled && this.props.selectedValues !== undefined ? true : false;

            selectionState = <SelectionState
                selection={deletionSelection}
                onSelectionChange={selection => this.changeDeletionSelection(selection, selectionToggledShouldPassSelectedValues)}
            />;
            integratedSelection = <IntegratedSelection/>;

            deleteSelected = !deleteExternally && <Button variant={deleteVariant} onClick={this.deleteSelected} style={deleteStyle} disabled={isModDisabled}>
                <FaTrash/> Delete Selected </Button>;
            deleteHint = !deleteExternally && showSelectTooltip && <ButtonToolbar>
                <OverlayTrigger trigger="hover" key="right" placement="right"
                                overlay={
                                    <Popover id={`popover-position-right`}
                                             title={`Hint`}>

                                        To make selection(s), either click on the checkbox or directly
                                        on the row.
                                    </Popover>
                                }
                >

                    <Button variant="light" style={{marginLeft: 5, height: '30px'}}><FaQuestion/></Button>

                </OverlayTrigger>
            </ButtonToolbar>;
        }

        //Declaring the refresh button; note that it checks if the viewSetup is bare & avoids rendering if so.
        let refresh;
        if (viewSetup && viewSetup !== "bare")
            refresh = <Button variant={refreshVariant} onClick={this.performRefresh} style={refreshStyle}>
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
        if (viewSetup && viewSetup !== "simple") {

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
                                      onKeyPress={event => {
                                          if (event.key === "Enter") {
                                              event.preventDefault();
                                              this.performSearch();
                                          }
                                      }}
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
                                      onKeyPress={event => {
                                          if (event.key === "Enter") {
                                              event.preventDefault();
                                              this.performSearch();
                                          }
                                      }}
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

        let menuBar;
        if (viewSetup && viewSetup !== "bare"){
            menuBar = <Container fluid={true} style={{marginRight: 1}}>
                <Row noGutters={true}>
                    <Col xs="auto">
                        {menuOptions}
                    </Col>

                    <Col style={{float: 'right', textAlign: 'right', margin: '0', padding: '0'}}>
                        {refresh}
                    </Col>
                </Row>
                <Row noGutters={true} style={{paddingTop: 5}}>
                    {deleteSelected}
                    {deleteHint}
                </Row>
            </Container>;
        }

        let filteringState, integratedFiltering;
        if (filterByColumnEnabled) {
            filteringState = <FilteringState
                filters={filterArray}
            />;
            integratedFiltering = <IntegratedFiltering />;
        }

        let table;
        if (tableCell && tableColumnExtensions) {
            table = <Table
                tableComponent={TableComponent}
                cellComponent={tableCell}
                columnExtensions={tableColumnExtensions}
            />;
        } else if (tableColumnExtensions) {
            table = <Table
                tableComponent={TableComponent}
                columnExtensions={tableColumnExtensions}
            />;
        } else if (tableCell) {
            table = <Table
                tableComponent={TableComponent}
                cellComponent={tableCell}
            />;
        } else {
            table = <Table
                tableComponent={TableComponent}
            />;
        }

        let sortingConfig;
        if (gridSorting) {
            let sortingArray = [];

            gridSorting.forEach(sortingObj => {
                let sortingObject = {};
                let prop = Object.keys(sortingObj)[0];

                sortingObject["columnName"] = prop;
                sortingObject["direction"] = sortingObj[prop];

                sortingArray.push(sortingObject);
            });

            sortingConfig = sortingArray;
        } else {
            sortingConfig = sorting;
        }

        let integratedSorting;
        if (!remoteSortingToggled) {
            integratedSorting = <IntegratedSorting/>;
            if (sortingColumnExtensions) {
                integratedSorting = <IntegratedSorting columnExtensions={sortingColumnExtensions}/>;
            }
        }

        let tableColumnVisibility;
        if (hiddenColumns) {
            tableColumnVisibility = <TableColumnVisibility defaultHiddenColumnNames={hiddenColumns}/>;
        }

        let groupingState, integratedGrouping, tableGroupRow;
        if (groupBy) {
            if (groupsExpanded)
                groupingState = <GroupingState grouping={[{columnName: groupBy}]} expandedGroups={groupKeyArray} onExpandedGroupsChange={expandedGroups => this.setState({groupKeyArray: expandedGroups})}/>;
            else
                groupingState = <GroupingState grouping={[{columnName: groupBy}]}/>;

            integratedGrouping = <IntegratedGrouping />;

            if (hideColumnName === true) {
                tableGroupRow = <TableGroupRow contentComponent={GroupCellContent}/>;
            } else
                tableGroupRow = <TableGroupRow />;
        }

        let summaryState, summaryRow, currencyType;
        let summaryPlugin;
        if (summaryItems && Array.isArray(summaryItems) && summaryItems.length > 0) {
            let columnName = [];
            if (summaryItems.length > 0)
                columnName = summaryItems[0]['columnName'];

            summaryState = <SummaryState totalItems={summaryItems} />;
            summaryRow = <TableSummaryRow messages={{sum: 'Total Cost'}}/>;
            currencyType = <DataTypeProvider formatterComponent={({value}) => `$${value}`} for={[columnName]}/>;

            if (summaryValue !== undefined)
                summaryPlugin = <CustomSummary totalValues={[summaryValue]} />;
            else
                summaryPlugin =  <IntegratedSummary />;
        }

        if (showGroupCount && groupBy !== undefined && groupBy !== null && groupBy !== "") {
            if (summaryState !== undefined && summaryState !== null && summaryItems && Array.isArray(summaryItems) && summaryItems.length > 0) {
                summaryState = <SummaryState totalItems={summaryItems}
                                             groupItems={[{columnName: groupBy, type: 'count', showInGroupFooter: false}]}/>;
            } else {
                summaryState = <SummaryState groupItems={[{columnName: groupBy, type: 'count', showInGroupFooter: false}]}/>;
                summaryPlugin =  <IntegratedSummary />;
            }
        }

        let editingState, tableEditRow;
        if (editExternally) {
            editingState = <EditingState
                editingRowIds={this.state.editingRowIds}
                onEditingRowIdsChange={(row) => this.editEntry(row[0])}
            />;
        } else if (viewSetup === "all" || viewSetup === "allnosearch") {
            editingState = <EditingState
                editingRowIds={this.state.editingRowIds}
                onEditingRowIdsChange={this.changeEditingRowIds}
                rowChanges={this.state.rowChanges}
                onRowChangesChange={this.changeRowChanges}
                onCommitChanges={this.commitChanges}

                columnExtensions={this.state.editingStateColumnExtensions}
            />;
            tableEditRow = <TableEditRow/>;
        }

        if (editAlways) {
            options = <TableEditColumn showEditCommand/>;
        }

        let pagingPanel;
        if (showPagingPanel)
            pagingPanel = <PagingPanel
                pageSizes={pageSizes}
            />;

        let rowDetailState, tableRowDetail;
        if (rowDetailsEnabled) {
            rowDetailState = <RowDetailState/>;
            tableRowDetail = <TableRowDetail contentComponent={rowDetailsContent}/>
        }

        return (
            <div style={{fontSize: '12px'}} className={gridContainerClass}>
                {/*=============================== Menu Bar Portion ===============================*/}
                {menuBar}

                {/*=============================== Grid Portion ===============================*/}
                <Grid
                    rows={rows}
                    columns={columns}
                >
                    <SortingState
                        sorting={sortingConfig}
                        onSortingChange={this.changeSorting}
                    />

                    {editingState}

                    <PagingState
                        currentPage={currentPage}
                        onCurrentPageChange={this.changeCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={this.changePageSize}
                    />

                    {selectionState}
                    {dragDropProvider}

                    {filteringState}
                    {integratedFiltering}

                    {groupingState}
                    {integratedGrouping}

                    {rowDetailState}

                    {integratedSelection}
                    {integratedSorting}

                    {pagingPlugin}

                    {currencyType}
                    {summaryState}
                    {summaryPlugin}

                    {table}

                    <TableColumnResizing
                        columnWidths={colWidths}
                        onColumnWidthsChange={this.changeColumnWidths}
                    />

                    <TableHeaderRow showSortingControls/>
                    {tableColumnVisibility}
                    {tableEditRow}
                    {options}
                    {multiSelect}

                    {tableColumnReordering}

                    {tableSelection}
                    {tableRowDetail}
                    {summaryRow}
                    {tableGroupRow}
                    {pagingPanel}
                </Grid>

            </div>
        );
    }
}

//=========================================== DOCUMENTATIONS ===========================================================

GridComponent.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.exact({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired
    })),

    /**
     <b>Description:</b> The list of rows (data) for the given grid. <b><i> Object keys must match the column names (case-sensitive) without spaces. Also symbols must be omitted from the keys.</i></b>
     <i> Note: for proper sorting behavior, ensure to pass numbers as column values for number-typed columns. </i>

     <b>Value:</b> Json array whose keys corresponds to the columns prop.
     [
     {<name of column>: <column value>, <next column>: <column value>, ...},
     ...
     ]
     <b>Example: </b>
     [
     {"FirstName": "John", "LastName": "Doe", "Age": 24},
     {"FirstName": "Jane", "LastName": "Doe", "Age": 19},
     ]
     */
    rows: PropTypes.arrayOf(
        PropTypes.objectOf(
            PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ])
        )
    ).isRequired,

    disableModifications: PropTypes.bool,

    /**
     <b>Description:</b> The specified column widths for each column. If not specified, the default will be applied. <b><i> Object keys must match the column names (case-sensitive) without spaces. Also symbols must be omitted from the keys.</i></b>

     <b>Value:</b> Json object whose keys corresponds to the columns prop.
     [
     {<name of column>: <column width>, <next column>: <column width>, ...},
     ...
     ]

     <b>Default:</b> 180

     <b>Example: </b>
     {"FirstName": 150, "LastName": 150, "Age": 50},
     */
    columnWidths: PropTypes.objectOf(PropTypes.number),

    /**
     <b>Description:</b> Toggles a particular grid setup such as showing the grid only/grid + refresh button/grid + refresh + search, etc.

     <b>Value:</b> a string of either
     i. "bare" = renders only the grid with pagination & "# of entries at a time" options available.
     ii. "simple" = similar to bare, but includes a refresh button
     iii. "search" = similar to simple, but includes search by column components
     iv. "all" = similar to search but includes the create/edit/delete components
     v. "allnosearch" = similar to all but excludes the search by column components

     <b>Default:</b> "simple"
     */
    viewConfig: PropTypes.oneOf([
        'bare',
        'simple',
        'search',
        'all',
        'allnosearch'
    ]),

    /**
     <b>Description:</b> Toggles whether to show the select buttons on the left side of the rows for external manipulation. If set to true, then selectValues prop *needs* to exist & have a callback function set to it, otherwise the select buttons will NOT render. It will also not render if "viewConfig" is set to "all" or "allnosearch".
     <b>Value:</b> takes a boolean

     <b>Default:</b> false
     */
    toggleSelect: PropTypes.bool,

    /**
     <b>Description:</b> A callback function called by GridComponent to pass the values that the users have selected to the parent component; this will return an array of json object(s) that corresponds to the ones provided in the rows prop.
     <b>Value:</b> A callback function
     */
    selectedValues: function(props, propName) {
        if (props['toggleSelect'] === true && props[propName] === undefined){
            return new Error(
                'Setting toggleSelect prop to true requires for selectedValues to be defined.'
            );
        }
        else if (props['toggleSelect'] === true && (typeof props[propName] !== 'function')){
            return new Error(
                'selectedValues requires a function as value.'
            );
        }
    },

    /**
     <b>Description:</b> A list of columns that will be blocked from editing.
     <b>Value:</b> An array corresponding to elements in the "columns" prop.
     */
    blockedColumns: PropTypes.array,

    /**
     <b>Description:</b> A list of columns that will be blocked for searching.
     <b>Value:</b> An array corresponding to elements in the "columns" prop.
     */
    blockedSearchColumns: PropTypes.array,

    /**
     <b>Description:</b> Setting the default number of entries to view per page, as well as what options will be provided to the user.
     <b>Value:</b> Takes an array composed of two elements:
     i. The default page size set
     ii. An array of page size options

     <b>Default:</b> [10, [10, 25, 50]]
     */
    pageConfig: PropTypes.array,

    /**
     <b>Description:</b> Toggles whether the user is allowed to reorder the columns.
     <b>Value:</b> Boolean
     */
    colReorder: PropTypes.bool,

    /**
     <b>Description:</b> When viewConfig is set to "all" or "allnosearch", this property must be included to retrieve the rows that the user opted to delete. The callback function will be called with a parameter containing an array of json objects corresponding to the rows provided in "rows" prop.
     <b>Value:</b> A callback function.
     */
    deletedValues: function(props, propName) {
        if ((props['viewConfig'] === 'all' || props['viewConfig'] === 'allnosearch') && props[propName] === undefined){
            return new Error(
                'Setting viewConfig prop to "all" or "allnosearch" requires for deletedValues to be defined.'
            );
        }
        else if ((props['viewConfig'] === 'all' || props['viewConfig'] === 'allnosearch') && (typeof props[propName] !== 'function') ){
            return new Error(
                'deletedValues requires a function as value.'
            );
        }
    },

    /**
     <b>Description:</b> When viewConfig is set to "all" or "allnosearch", this property must be included to retrieve the row that has been edited. The callback function will be called with a parameter containing an array of json objects where the first element is a row corresponding to one of the rows in the "row" prop, and the second element being the changes made to that row.
     <b>Value:</b> A callback function.
     */
    editedValues: function(props, propName) {
        if ((props['viewConfig'] === 'all' || props['viewConfig'] === 'allnosearch') && props[propName] === undefined){
            return new Error(
                'Setting viewConfig prop to "all" or "allnosearch" requires for editedValues to be defined.'
            );
        }
        else if ((props['viewConfig'] === 'all' || props['viewConfig'] === 'allnosearch') && (typeof props[propName] !== 'function') ){
            return new Error(
                'editedValues requires a function as value.'
            );
        }
    },

    /**
     <b>Description:</b> When viewConfig is set to "all" or "allnosearch", this property must be included to respond to the user's desire to add new entry.
     <i> Note: that this won't provide any create form. </i>
     <b>Value:</b> A callback function.
     */
    createToggled: function(props, propName) {
        if ((props['viewConfig'] === 'all' || props['viewConfig'] === 'allnosearch') && props[propName] === undefined){
            return new Error(
                'Setting viewConfig prop to "all" or "allnosearch" requires for createToggled to be defined.'
            );
        }
        else if ((props['viewConfig'] === 'all' || props['viewConfig'] === 'allnosearch') && (typeof props[propName] !== 'function') ){
            return new Error(
                'createToggled requires a function as value.'
            );
        }
    },

    /**
     <b>Description:</b> When viewConfig is set to "simple", "search", "all" or "allnosearch", this property must be included to respond to the user's desire to refresh the data in the grid. Note that the ideal response to this is to change the values provided in the "columns" and "rows" prop of GridComponent to reflect the latest data.
     <b>Value:</b> A callback function.
     */
    refreshToggled: function(props, propName) {
        if ((props['viewConfig'] !== 'bare') && props[propName] !== undefined){
            return new Error(
                'Setting viewConfig prop to anything but "bare" requires for refreshToggled to be defined.'
            );
        }
        else if ((props['viewConfig'] !== 'bare') && props[propName] !== undefined && (typeof props[propName] !== 'function') ){
            return new Error(
                'refreshToggled requires a function as value.'
            );
        }
    },

    /**
     <b>Description:</b> Toggles whether remote paging is implemented to this grid or not. This will require totalCount, currentPage, and currentPageSize props to also be provided.
     <b>Value:</b> Boolean
     */
    remotePaging: PropTypes.bool,

//------------
    /**
     <b>Description:</b> Required when remotePaging is toggled to true; this lets the GridComponent know how many data it will page through.
     <b>Value:</b> Number
     */
    totalCount: function(props, propName) {
        if ((props['remotePaging'] === true) && props[propName] === undefined){
            return new Error(
                'Setting remotePaging prop to true requires for totalCount to be defined.'
            );
        }
        else if ((props['remotePaging'] === true) && (typeof props[propName] !== 'number') ){
            return new Error(
                'totalCount requires a number as value.'
            );
        }
    },

    /**
     <b>Description:</b> Required when remotePaging is toggled to true; this lets GridComponent know which page to toggle as selected.
     <b>Value:</b> Callback function.
     */
    currentPage: function(props, propName) {
        if ((props['remotePaging'] === true) && props[propName] === undefined){
            return new Error(
                'Setting remotePaging prop to true requires for currentPage to be defined.'
            );
        }
        else if ((props['remotePaging'] === true) && (typeof props[propName] !== 'function') ){
            return new Error(
                'currentPage requires a function as value.'
            );
        }
    },

    changeCurrentPage: function(props, propName) {
        if ((props['remotePaging'] === true) && props[propName] === undefined){
            return new Error(
                'Setting remotePaging prop to true requires for changeCurrentPage to be defined.'
            );
        }
        else if ((props['remotePaging'] === true) && (typeof props[propName] !== 'function') ){
            return new Error(
                'changeCurrentPage requires a function as value.'
            );
        }
    },

    /**
     <b>Description:</b> Required when remotePaging is toggled to true; this lets GridComponent know which pageSize to toggle as selected.
     <b>Value:</b> Callback function.
     */
    currentPageSize: function(props, propName) {
        if ((props['remotePaging'] === true) && props[propName] === undefined){
            return new Error(
                'Setting remotePaging prop to true requires for currentPageSize to be defined.'
            );
        }
        else if ((props['remotePaging'] === true) && (typeof props[propName] !== 'function') ){
            return new Error(
                'currentPageSize requires a function as value.'
            );
        }
    },

    changeCurrentPageSize: function(props, propName) {
        if ((props['remotePaging'] === true) && props[propName] === undefined){
            return new Error(
                'Setting remotePaging prop to true requires for changeCurrentPageSize to be defined.'
            );
        }
        else if ((props['remotePaging'] === true) && (typeof props[propName] !== 'function') ){
            return new Error(
                'changeCurrentPageSize requires a function as value.'
            );
        }
    },

    editExternally: PropTypes.bool,
    editToggled: function(props, propName) {
        if (props['editExternally'] === true && props[propName] === undefined){
            return new Error(
                'Setting editExternally prop to true requires for editToggled to be defined.'
            );
        }
        else if (props['editExternally'] === true && (typeof props[propName] !== 'function')){
            return new Error(
                'editToggled requires a function as value.'
            );
        }
    },

    hideOnSubmit: PropTypes.bool,

    clearDeletedRows: PropTypes.bool,
    revertClearDeletedRows: function(props, propName) {
        if (props['clearDeletedRows'] === true && props[propName] === undefined){
            return new Error(
                'Setting clearDeletedRows prop to true requires for revertClearDeletedRows to be defined.'
            );
        }
        else if (props['clearDeletedRows'] === true && (typeof props[propName] !== 'function')){
            return new Error(
                'revertClearDeletedRows requires a function as value.'
            );
        }
    },

    resetSelections: PropTypes.bool,
    selectionsWereReset: function(props, propName) {
        if (props['resetSelections'] === true && props[propName] === undefined){
            return new Error(
                'Setting resetSelections prop to true requires for selectionsWereReset to be defined.'
            );
        }
        else if (props['resetSelections'] === true && (typeof props[propName] !== 'function')){
            return new Error(
                'selectionsWereReset requires a function as value.'
            );
        }
    },

    searchValue: function(props, propName) {
        if (props['viewConfig'] === "all" && props[propName] === undefined){
            return new Error(
                'Setting viewConfig prop to "all" requires for searchValue to be defined.'
            );
        }
        else if (props['viewConfig'] === "all" && (typeof props[propName] !== 'function')){
            return new Error(
                'searchValue requires a function as value.'
            );
        }
    },

    resetSearch: PropTypes.bool,
    revertResetSearch: function(props, propName) {
        if (props['resetSearch'] === true && props[propName] === undefined){
            return new Error(
                'Setting resetSearch prop to true requires for revertResetSearch to be defined.'
            );
        }
        else if (props['resetSearch'] === true && (typeof props[propName] !== 'function')){
            return new Error(
                'revertResetSearch requires a function as value.'
            );
        }
    },

    filterByColumnEnabled: PropTypes.bool,
    filterArray: function(props, propName) {
        if (props['filterByColumnEnabled'] === true){
            if (props[propName] === undefined) {
                return new Error(
                    'Setting filterByColumnEnabled prop to true requires for filterArray to be defined.'
                );
            } else {
                return PropTypes.arrayOf(PropTypes.exact({
                    columnName: PropTypes.string.isRequired,
                    value: PropTypes.oneOfType([
                        PropTypes.string,
                        PropTypes.number
                    ]).isRequired
                }))
            }
        }
    },

    groupsEnabled: PropTypes.bool,
    groupBy: function(props, propName) {
        if (props['groupsEnabled'] === true) {
            if (props[propName] === undefined) {
                return new Error(
                    'Setting groupsEnabled prop to true requires for groupBy to be defined.'
                );
            } else {
                return PropTypes.oneOfType([
                    PropTypes.array,
                    PropTypes.string
                ]).isRequired
            }
        }
    },

    summaryItemsEnabled: PropTypes.bool,
    summaryItems: function(props, propName) {
        if (props['summaryItemsEnabled'] === true) {
            if (props[propName] === undefined) {
                return new Error(
                    'Setting summaryItemsEnabled prop to true requires for summaryItems to be defined.'
                );
            } else {
                return PropTypes.arrayOf(
                    PropTypes.exact({
                        columnName: PropTypes.string.isRequired,
                        type: PropTypes.oneOf([
                            'sum',
                            'max',
                            'min',
                            'avg',
                            'count'
                        ])
                    })
                ).isRequired
            }
        }
    },

    summaryIsCustomized: PropTypes.bool,
    summaryValue: function(props, propName) {
        if (props['summaryIsCustomized'] === true) {
            if (props[propName] === undefined) {
                return new Error(
                    'Setting summaryIsCustomized prop to true requires for summaryValue to be defined.'
                );
            } else {
                return PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.number
                ]).isRequired
            }
        }
    },

    gridSorting: PropTypes.arrayOf(
        PropTypes.objectOf(
            PropTypes.oneOf([
                'asc',
                'desc'
            ])
        )
    ),

    sortingColumnExtensions: PropTypes.arrayOf(
        PropTypes.exact({
            columnName: PropTypes.string.isRequired,
            compare: PropTypes.func.isRequired
        })
    ),

    remoteSorting: PropTypes.bool,
    selectedSorting: function(props, propName) {
        if (props['remoteSorting'] === true) {
            if (props[propName] === undefined) {
                return new Error(
                    'Setting remoteSorting prop to true requires for selectedSorting to be defined.'
                );
            } else {
                return PropTypes.func.isRequired
            }
        }
    },

    hiddenColumns: PropTypes.arrayOf(PropTypes.string),

    buttonColors: PropTypes.exact(({
        createColor: PropTypes.string,
        createTextColor: PropTypes.string,

        editColor: PropTypes.string,
        editTextColor: PropTypes.string,

        deleteColor: PropTypes.string,
        deleteTextColor: PropTypes.string,

        refreshColor: PropTypes.string,
        refreshTextColor: PropTypes.string,
    })),

    gridContainerClass: PropTypes.string,
    showPagingPanel: PropTypes.bool,
    tableCell: PropTypes.element
};

export default GridComponent;