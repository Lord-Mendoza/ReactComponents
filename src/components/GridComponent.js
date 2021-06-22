import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import Moment from "moment";
import {Button, Form, Icon, Popup} from "semantic-ui-react";

//Styling
import "../styling/GridComponent.css";

//Validators
import {isNotEmptyString} from "../utilities/StringVariableValidators";
import {isNotAnEmptyArray} from "../utilities/ArrayVariableValidators";
import {
    isNotAnEmptyObject,
    isNotNullNorUndefined,
    isNotSameObject,
    isNullOrUndefined
} from "../utilities/ObjectVariableValidators";
import {isANumber} from "../utilities/NumberVariableValidator";

//Dev-Express
import {
    DragDropProvider,
    Grid,
    PagingPanel,
    SearchPanel,
    Table,
    TableColumnReordering,
    TableColumnResizing,
    TableColumnVisibility,
    TableEditColumn,
    TableEditRow,
    TableGroupRow,
    TableHeaderRow,
    TableInlineCellEditing,
    TableRowDetail,
    TableSelection,
    TableSummaryRow,
    TableTreeColumn,
    Toolbar
} from '@devexpress/dx-react-grid-bootstrap4';
import {
    CustomPaging,
    CustomSummary,
    CustomTreeData,
    DataTypeProvider,
    EditingState,
    GroupingState,
    IntegratedFiltering,
    IntegratedGrouping,
    IntegratedPaging,
    IntegratedSelection,
    IntegratedSorting,
    IntegratedSummary,
    PagingState,
    RowDetailState,
    SearchState,
    SelectionState,
    SortingState,
    SummaryState,
    TreeDataState
} from "@devexpress/dx-react-grid";
import {compareDates} from "../utilities/CompareDates";
import PopupComponent from "./PopupComponent";
import {Col, Container, Image, Modal, Row} from "react-bootstrap";
import warningImg from "../images/warning.png";
import {FaCheck, FaTimes} from "react-icons/fa";
import DatePicker from "react-datepicker";
import Select from "react-select";

class GridComponent extends React.Component {
    constructor(props) {
        super(props);

        const {
            columns,
            columnWidths,
            rows,
            grouping,
            expandGroupsByDefault
        } = props;

        let groupKeyArray = [];
        if (expandGroupsByDefault) {
            if (isNotAnEmptyArray(rows)) {
                for (let i = 0; i < rows.length; i++) {
                    if (!groupKeyArray.includes(rows[i][grouping])) {
                        groupKeyArray.push(rows[i][grouping]);
                    }
                }
            }
        }

        this.state = {
            columnOrder: isNotAnEmptyArray(columns) ? columns.map(v => {
                return v["name"]
            }) : [],
            columnWidths: isNotAnEmptyObject(columnWidths) ? this.getColumnWidths(columnWidths) : [],
            groupKeyArray,

            onCommitObj: {},
            showConfirmationPopup: false, confirmationMessage: ""
        }

        this.getColumnWidths = this.getColumnWidths.bind(this);
        this.changeColumnWidths = columnWidths => this.setState({columnWidths});
        this.changeColumnOrder = columnOrder => this.setState({columnOrder});
        this.changeCurrentPage = currentPage => {
            const {rows} = this.props;

            if (isNotAnEmptyArray(rows))
                this.setState({currentPage})
        }
        this.changePageSize = pageSize => {
            const {rows} = this.props;

            if (isNotAnEmptyArray(rows))
                this.setState({pageSize})
        }
        this.changeExpandedGroups = expandedGroups => {
            this.setState({groupKeyArray: expandedGroups})
        }
    }

    componentDidMount() {
        // Sets the placeholder from "Searching..." to "Filtering..." for better accuracy
        // Only works the first time
        // if (isNotNullNorUndefined(document.querySelector('.w-25'))) {
        //     document.querySelector('.w-25').setAttribute('placeholder', 'Filtering...');
        // }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            rows, columns,
            columnWidths,
            grouping, expandGroupsByDefault
        } = this.props;

        if (prevProps["columns"] !== columns) {
            this.setState({
                columnOrder: isNotAnEmptyArray(columns) ? columns.map(v => {
                    return v["name"]
                }) : []
            })
        }

        if (prevProps["columnWidths"] !== columnWidths) {
            this.setState({
                columnWidths: isNotAnEmptyObject(columnWidths) ? this.getColumnWidths(columnWidths) : []
            })
        }

        if (prevProps["rows"] !== rows && expandGroupsByDefault) {
            let groupKeyArray = [];
            if (expandGroupsByDefault) {
                if (isNotAnEmptyArray(rows)) {
                    for (let i = 0; i < rows.length; i++) {
                        if (!groupKeyArray.includes(rows[i][grouping])) {
                            groupKeyArray.push(rows[i][grouping]);
                        }
                    }
                }
            }

            this.setState({
                groupKeyArray
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
         if (this.props !== nextProps)
             return true;
         else if (isNotSameObject(this.props, nextProps))
             return true;
         else if (this.state !== nextState)
             return true;
         else if (isNotSameObject(this.state, nextState)) {
             return true;
         } else {
            return false;
        }
    }

    getColumnWidths(columnWidths) {
        const {columns} = this.props;

        return columns.map(v => {
            if (columnWidths && columnWidths.hasOwnProperty(v["name"]))
                return {columnName: v["name"], width: columnWidths[v["name"]]};
            else if (v["name"] === "treeDropdown")
                return {columnName: v["name"], width: 40};
            else
                return {columnName: v["name"], width: 180};
        });
    }

    render() {
        const {
            columnWidths, columnOrder,

            groupKeyArray,

            showConfirmationPopup, onCommitObj
        } = this.state;

        const {
            //Required
            rows, columns,

            //Data-Config
            isTreeData,

            //Column-Config
            allowColumnReorder, hiddenColumns,

            //Row-Config
            allowRowDetail, rowDetailContent,

            //Table-Cell Config
            tableCellConfig,

            //Filtering
            allowFiltering,

            //Grouping
            allowGrouping, grouping, expandGroupsByDefault, hideColumnNameInGrouping, showGroupCount,

            //Summarizing
            allowSummarizing, summaryItems, summaryItemLabels, customSummaries,

            //Selecting
            allowSelections, selections, changeSelections, showSelectAll, selectByRowClick,

            //Data Modifications
            allowCreating, allowEditing, allowDeleting, editConfig,
            onCommitChanges, showDeleteConfirmation, deleteConfirmationMessage,

            //Paging
            showPagingPanel, pageSizes, allowRemotePaging, totalCount,

            //Sorting
            allowSorting, allowRemoteSorting, columnsSorting,

            //Refreshing
            allowRefreshing, refreshData,

            //Exporting
            allowExporting, exportData,

            //Total Count
            showTotalCount,

            //Styling
            maxGridWidth, maxGridHeight, gridContainerClass, showButtonLabels
        } = this.props;

        //Variables that can be used by multiple configurations
        let toolbar, summaryStateProps = {}, editingStateProps = {};
        const gridEditConfig = isNotAnEmptyObject(editConfig) ? editConfig : {};
        const {editFormat, fields, fieldsHeight, selectTextOnEditStart, startEditAction} = gridEditConfig;
        const gridEditFormat = isNotEmptyString(editFormat) ? editFormat : "row";
        const editFieldsHeight = isNotNullNorUndefined(fieldsHeight) ? fieldsHeight : "25px";

        //-------------------------------------------------------
        //Type providers for specifying how data should be displayed, and how the editor component will appear
        let typeProviders = [];

        //~~~~~~~~~~~~~~~~~~~ Setting Up How Data Is Displayed By Column Type ~~~~~~~~~~~~~~~~~~~~~~~~
        //Filtering currency, number, and date columns for right-alignments, and adding $ ("currency")
        let numberColumns = [], currencyColumns = [], dateColumns = {};
        if (isNotAnEmptyArray(columns)) {
            columns.forEach(column => {
                switch (column["type"]) {
                    case "number":
                        numberColumns.push(column.name);
                        break;
                    case "currency":
                        currencyColumns.push(column.name);
                        break;
                    case "date":
                        if (isNotEmptyString(column["format"]))
                            dateColumns[column.name] = {format: column["format"]};
                        else
                            dateColumns[column.name] = {format: "MM/DD/YYYY"};
                        break;
                    default:
                        break;
                }
            })
        }

        //Used for right-aligning currency and number types
        let tableColumnExtensions = {}

        //------------------------------------------------------
        //Currency Type
        if (isNotAnEmptyArray(currencyColumns)) {
            let usdFormat = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            });

            typeProviders.push(
                <DataTypeProvider
                    for={currencyColumns}
                    formatterComponent={
                        ({value}) => {
                            if (isANumber(value))
                                return usdFormat.format(value)
                            else
                                return usdFormat.format(0)
                        }
                    }
                />
            )
        }

        if (isNotAnEmptyArray(currencyColumns) || isNotAnEmptyArray(numberColumns)) {
            let rightAlignedColumns = currencyColumns.slice().concat(numberColumns);

            tableColumnExtensions["columnExtensions"] = rightAlignedColumns.map(column => {
                return {columnName: column, align: 'right'}
            })
        }

        //------------------------------------------------------
        //Date Type
        if (isNotAnEmptyObject(dateColumns)) {
            typeProviders.push(
                <DataTypeProvider
                    for={Object.keys(dateColumns)}
                    formatterComponent={
                        ({column, value}) => {
                            if (Moment(value).isValid())
                                return Moment(value).format(dateColumns[column.name]["format"]);
                            else
                                return "";
                        }
                    }
                />
            )
        }

        //~~~~~~~~~~~~~~~~ Setting Up How Edit Fields Are Displayed By Fields Prop ~~~~~~~~~~~~~~~~~~~~~~~~
        //Filtering editable fields and adding necessary edit cell configuration
        let integerColumns = [], doubleColumns = [], booleanColumns = [], dropdownColumns = {}, dateEditColumns = {};
        if (isNotAnEmptyObject(fields)) {
            Object.keys(fields).forEach(field => {
                if (typeof fields[field]["type"] === "string") {
                    switch (fields[field]["type"]) {
                        case "integer":
                            integerColumns.push(field);
                            break;
                        case "double":
                            doubleColumns.push(field);
                            break;
                        case "boolean":
                            booleanColumns.push(field);
                            break;
                        case "date":
                            if (isNotEmptyString(field["format"]))
                                dateEditColumns[field] = {format: field["format"]};
                            else
                                dateEditColumns[field] = {format: "MM/DD/YYYY"};
                            break;
                        default:
                            break;
                    }
                } else if (typeof fields[field]["type"] === "object") {
                    if (Object.keys(fields[field]["type"]).includes("dropdown")) {
                        let isClearable = fields[field]["isClearable"] !== false

                        let menuConfig;
                        if (isNotNullNorUndefined(fields[field]["menuWidth"]))
                            menuConfig = (provided) => ({
                                ...provided,
                                width: fields[field]["menuWidth"],
                                zIndex: '1000',
                                lineHeight: 1
                            });
                        else
                            menuConfig = (provided) => ({...provided, zIndex: '1000', lineHeight: 1});

                        dropdownColumns[field] = {isClearable, menuConfig, dropdown: fields[field]["type"]["dropdown"]}
                    }
                }
            })
        }

        //------------------------------------------------------
        //Integer Type
        if (isNotAnEmptyArray(integerColumns)) {
            typeProviders.push(
                <DataTypeProvider
                    for={integerColumns}
                    editorComponent={
                        ({...restProps}) =>
                            numberEditorComponent(gridEditFormat, restProps)
                    }
                />
            )
        }

        //------------------------------------------------------
        //Double Type
        if (isNotAnEmptyArray(doubleColumns)) {
            typeProviders.push(
                <DataTypeProvider
                    for={doubleColumns}
                    editorComponent={
                        ({...restProps}) =>
                            doubleEditorComponent(gridEditFormat, restProps)
                    }
                />
            )
        }

        //------------------------------------------------------
        //Date (Editable) Type
        if (isNotAnEmptyObject(dateEditColumns)) {
            typeProviders.push(
                <DataTypeProvider
                    for={Object.keys(dateEditColumns)}
                    editorComponent={
                        //Editor for the currency type is same as double
                        ({...restProps}) =>
                            dateEditorComponent(gridEditFormat, restProps)
                    }
                />
            )
        }

        //------------------------------------------------------
        //Boolean Type
        if (isNotAnEmptyArray(booleanColumns)) {
            typeProviders.push(
                <DataTypeProvider
                    for={booleanColumns}
                    editorComponent={({...restProps}) =>
                        booleanEditorComponent(gridEditFormat, {...restProps, editFieldsHeight})}
                />
            )
        }

        //------------------------------------------------------
        //Dropdown Type
        if (isNotAnEmptyObject(dropdownColumns)) {
            typeProviders.push(
                <DataTypeProvider
                    for={Object.keys(dropdownColumns)}
                    editorComponent={({...restProps}) =>
                        dropdownEditorComponent(
                            gridEditFormat, {...restProps, dropdownColumns, editFieldsHeight}
                        )}
                />
            )
        }

        let editableColumns = integerColumns.concat(doubleColumns, booleanColumns, Object.keys(dropdownColumns), Object.keys(dateEditColumns));
        if (isNotAnEmptyArray(columns)) {
            let nonEditableFields = [];
            columns.forEach(column => {
                if (!editableColumns.includes(column.name)) {
                    nonEditableFields.push({columnName: column.name, editingEnabled: false});
                }
            })

            editingStateProps["columnExtensions"] = nonEditableFields;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~ End Of Type Handling ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        let tableColumnResizing;
        if (isNotAnEmptyArray(columnWidths)) {
            tableColumnResizing = <TableColumnResizing columnWidths={columnWidths}
                                                       onColumnWidthsChange={this.changeColumnWidths}
            />;
        }

        let dragDropProvider, tableColumnReordering;
        if (allowColumnReorder) {
            dragDropProvider = <DragDropProvider/>;
            tableColumnReordering = <TableColumnReordering order={columnOrder}
                                                           onOrderChange={this.changeColumnOrder}/>;
        }

        let tableColumnVisibility;
        if (isNotAnEmptyArray(hiddenColumns)) {
            tableColumnVisibility = <TableColumnVisibility defaultHiddenColumnNames={hiddenColumns}/>;
        }

        //-------------------------------------------------------
        //Row Configurations
        let rowDetailState, tableRowDetail;
        if (allowRowDetail && isNotNullNorUndefined(rowDetailContent)) {
            rowDetailState = <RowDetailState/>;
            tableRowDetail = <TableRowDetail contentComponent={rowDetailContent}/>
        }

        //-------------------------------------------------------
        //Data Configurations
        let treeDataState, customTreeData, tableTreeColumn;
        if (isTreeData) {
            treeDataState = <TreeDataState/>;
            customTreeData = <CustomTreeData getChildRows={(row, rootRows) => {
                return row ? row.children : rootRows;
            }}/>;
            tableTreeColumn = <TableTreeColumn for={columns[0].name}/>
        }

        //-------------------------------------------------------
        //Table Cell Configurations
        let tableCellComponent = {};
        if (isNotNullNorUndefined(tableCellConfig)) {
            tableCellComponent["cellComponent"] = ({row, column, ...restProps}) => {
                if (Object.keys(tableCellConfig).includes(column.name)) {
                    const {onClick, style, renderedComponent} = tableCellConfig[column.name];

                    let tableCellProps = {};
                    if (typeof onClick === "function")
                        tableCellProps["onClick"] = () => onClick(row, column);
                    if (isNotAnEmptyObject(style))
                        tableCellProps["style"] = style;

                    if (isNotNullNorUndefined(renderedComponent)) {
                        return <Table.Cell
                            {...restProps}
                            {...tableCellProps}
                        >
                            {renderedComponent(row, column)}
                        </Table.Cell>;
                    } else {
                        return <Table.Cell
                            {...restProps}
                            {...tableCellProps}
                        />;
                    }
                } else if (allowEditing && editFormat === "cell" && editableColumns.includes(column.name)) {
                    return <Table.Cell
                        {...restProps}
                        style={{
                            border: "1px solid #a3bae9"
                        }}
                    />;
                } else {
                    return <Table.Cell {...restProps}/>;
                }
            }
        }

        //-------------------------------------------------------
        //Filtering
        let searchState, integratedFiltering, searchPanel;
        if (allowFiltering) {
            searchState = <SearchState/>;
            searchPanel = <SearchPanel/>;

            //The props below prevents any hidden columns from being searched. Can be made configurable
            // later if found to be needed.
            let integratedFilteringProps = {};
            if (isNotAnEmptyArray(hiddenColumns)) {
                integratedFilteringProps["columnExtensions"] = hiddenColumns.map(columnName => ({
                    columnName,
                    predicate: () => false
                }));
            }

            integratedFiltering = <IntegratedFiltering
                {...integratedFilteringProps}
            />;

            if (isNullOrUndefined(toolbar))
                toolbar = <Toolbar/>;
        }

        //-------------------------------------------------------
        //Grouping
        let integratedGrouping, groupingState, tableGroupRow;
        if (allowGrouping && grouping) {
            integratedGrouping = <IntegratedGrouping/>;

            let groupingStateProps = {};
            if (expandGroupsByDefault) {
                if (isNotAnEmptyArray(groupKeyArray)) {
                    groupingStateProps["expandedGroups"] = groupKeyArray;
                    groupingStateProps["onExpandedGroupsChange"] = this.changeExpandedGroups;
                }
            }

            groupingState = <GroupingState grouping={[{columnName: grouping}]}
                                           {...groupingStateProps}
            />;

            let tableGroupRowProps = {};
            if (hideColumnNameInGrouping) {
                tableGroupRowProps["contentComponent"] = ({row}) => (
                    <span>
                        <b>
                            {row.value}
                        </b>
                    </span>
                )
            }

            if (showGroupCount) {
                summaryStateProps["groupItems"] = [{columnName: grouping, type: 'count', showInGroupFooter: false}];
            }

            tableGroupRow = <TableGroupRow {...tableGroupRowProps}/>;
        }

        //-------------------------------------------------------
        //Summarizing
        let summaryPlugin, tableSummaryRow;
        if (allowSummarizing && isNotAnEmptyArray(summaryItems)) {
            summaryStateProps["totalItems"] = summaryItems;

            let tableSummaryRowProps = {};
            if (summaryItemLabels)
                tableSummaryRowProps["messages"] = summaryItemLabels;

            tableSummaryRow = <TableSummaryRow {...tableSummaryRowProps}/>;
        }

        //-------------------------------------------------------
        // Grouping & Summarizing can use similar hooks, so here it is accommodated for both cases
        let summaryState;
        if ((allowGrouping && grouping && showGroupCount) || (allowSummarizing && isNotAnEmptyArray(summaryItems))) {
            summaryState = <SummaryState {...summaryStateProps}/>;

            if (customSummaries)
                summaryPlugin = <CustomSummary totalValues={customSummaries}/>
            else
                summaryPlugin = <IntegratedSummary/>;
        }

        //-------------------------------------------------------
        //Summarizing
        let selectionState, tableSelection, integratedSelection;
        if (allowSelections && isNotAnEmptyArray(rows)) {
            selectionState = <SelectionState selection={isNotAnEmptyArray(selections) ? selections : []}
                                             onSelectionChange={changeSelections}/>;

            let tableSelectionProps = {};
            if (selectByRowClick)
                tableSelectionProps["selectByRowClick"] = true;
            if (showSelectAll) {
                tableSelectionProps["showSelectAll"] = true;
                integratedSelection = <IntegratedSelection/>;
            }

            tableSelection = <TableSelection {...tableSelectionProps}/>;
        }

        //-------------------------------------------------------
        //Data Modifications
        let editingState, tableEditRow, tableEditColumn, tableInlineCellEditing;
        if ((allowCreating || allowEditing || allowDeleting) && onCommitChanges) {

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //Initializing Edit State
            if (allowDeleting && showDeleteConfirmation) {
                editingStateProps["onCommitChanges"] = ({added, changed, deleted}) => {
                    if (isNotAnEmptyArray(deleted))
                        this.setState({showConfirmationPopup: true, onCommitObj: {added, changed, deleted}});
                    else
                        onCommitChanges({added, changed, deleted});
                };
            } else {
                /*
                The index that the edit state gives when the data is a tree data is based on a flattened version of
                rows. When the index is given it does not specify which child, and parent of the child, the target
                index is coming from.

                Below improves the flow by passing in an array of [parentIndex, childIndex] as the target index.
                It will make it easier to find the target row by doing:
                    rows[parent][child]

                As a refresher, the rows array will come as the following when it is a tree data ("id", "name" columns
                are just examples):
                    [
                        {
                            id: <parent id>,
                            name: <parent name>,
                            ...
                            children: [
                                {id: <first child id>},
                                {id: <second child id>}
                            ]
                        }
                    ]
                */
                if (isTreeData) {
                    editingStateProps["onCommitChanges"] = ({changed}) => {
                        let targetIndex = parseInt(Object.keys(changed)[0]);
                        let changeObject = changed[targetIndex];

                        if (isNotAnEmptyObject(changeObject)) {
                            if (isTreeData) {
                                let parentIndex = 0;
                                let childIndex = 0;
                                let parentChildCount = 0;

                                for (parentIndex; parentIndex < rows.length; parentIndex++) {
                                    let currentParent = rows[parentIndex];
                                    if (currentParent.hasOwnProperty("children")) {
                                        if (parentChildCount + 1 + currentParent["children"].length >= targetIndex) {
                                            parentChildCount++;
                                            childIndex = targetIndex - parentChildCount;
                                            break;
                                        } else {
                                            parentChildCount += currentParent["children"].length + 1;
                                        }
                                    } else {
                                        parentChildCount++;
                                    }
                                }

                                onCommitChanges({targetIndex: [parentIndex, childIndex], changeObject})
                            } else {
                                onCommitChanges({targetIndex, changeObject})
                            }
                        }
                    };
                } else
                    editingStateProps["onCommitChanges"] = onCommitChanges;
            }

            editingState = <EditingState {...editingStateProps}/>;

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //Initializing Table Edit Row
            if (allowCreating || (allowEditing && gridEditFormat === "row")) {
                tableEditRow = <TableEditRow/>;
            }

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //Initializing Table Edit Column
            let tableEditColumnProps = {};

            if (allowCreating)
                tableEditColumnProps["showAddCommand"] = true;
            if (allowEditing && gridEditFormat === "row")
                tableEditColumnProps["showEditCommand"] = true;
            if (allowDeleting)
                tableEditColumnProps["showDeleteCommand"] = true;

            if ((isNotAnEmptyArray(rows) && allowEditing && gridEditFormat === "row") || allowCreating) {
                tableEditColumn = <TableEditColumn {...tableEditColumnProps}/>;
            }

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //Initializing Table Inline Cell Editing
            if (allowEditing && gridEditFormat === "cell") {
                let tableInlineCellEditingProps = {};

                if (selectTextOnEditStart === false)
                    tableInlineCellEditingProps["selectTextOnEditStart"] = false;

                if (startEditAction === 'click')
                    tableInlineCellEditingProps["startEditAction"] = 'click';
                else
                    tableInlineCellEditingProps["startEditAction"] = 'doubleClick'

                tableInlineCellEditing = <TableInlineCellEditing {...tableInlineCellEditingProps}/>
            }
        }

        //-------------------------------------------------------
        //Paging
        let pagingPanel, pagingState, pagingPlugin;
        if (showPagingPanel !== false) {
            pagingPanel = <PagingPanel pageSizes={isNotAnEmptyArray(pageSizes) ? pageSizes : [10, 50, 100]}/>;

            if (allowRemotePaging) {
                let {currentPage, changeCurrentPage, pageSize, changePageSize} = this.props;

                if (!isANumber(pageSize)) {
                    if (isNotAnEmptyArray(pageSizes))
                        pageSize = pageSizes[0];
                    else
                        pageSize = 10;
                }

                pagingPlugin = <CustomPaging totalCount={totalCount}/>;
                pagingState = <PagingState
                    currentPage={currentPage}
                    onCurrentPageChange={currentPage => isNotAnEmptyArray(rows) && changeCurrentPage(currentPage)}
                    pageSize={pageSize}
                    onPageSizeChange={pageSize => isNotAnEmptyArray(rows) && changePageSize(pageSize)}
                />;
            } else {
                let {currentPage, pageSize} = this.state;

                if (!isANumber(pageSize)) {
                    if (isNotAnEmptyArray(pageSizes))
                        pageSize = pageSizes[0];
                    else
                        pageSize = 10;
                }

                pagingPlugin = <IntegratedPaging/>;
                pagingState = <PagingState
                    currentPage={currentPage}
                    onCurrentPageChange={this.changeCurrentPage}
                    pageSize={isANumber(pageSize) ? pageSize : isNotAnEmptyArray(pageSizes) ? pageSizes[0] : 10}
                    onPageSizeChange={this.changePageSize}
                />;
            }
        }

        //-------------------------------------------------------
        //Sorting
        let tableHeaderRowProps = {}, sortingState, integratedSorting;
        if (allowSorting && isNotAnEmptyArray(rows)) {
            tableHeaderRowProps = {showSortingControls: true};

            let integratedSortingProps = {};

            //Adds in the user-specified compare functions for sorting specified columns
            if (isNotAnEmptyArray(columnsSorting)) {
                integratedSortingProps["columnExtensions"] = columnsSorting;
            }

            //Adds internal date comparison given the column types for proper sorting
            if (isNotAnEmptyArray(columns)) {
                let columnsSortingForColumnTypes = Object.keys(columns)
                    .filter(column => (column["type"] === "date"))
                    .map(column => {
                        return {columnName: column, compare: compareDates}
                    })

                if (integratedSortingProps.hasOwnProperty("columnExtensions"))
                    integratedSortingProps["columnExtensions"].push(columnsSortingForColumnTypes);
                else
                    integratedSortingProps["columnExtensions"] = columnsSortingForColumnTypes;
            }

            integratedSorting = <IntegratedSorting {...integratedSortingProps}/>;

            if (allowRemoteSorting) {
                const {sorting, changeSorting} = this.props;

                sortingState = <SortingState sorting={sorting}
                                             onSortingChange={changeSorting}
                />;
            } else {
                sortingState = <SortingState/>;
            }
        }

        //-------------------------------------------------------
        //Total Count
        let gridTotalCount = isNotAnEmptyArray(rows) ? rows.length : 0
        if (isANumber(totalCount))
            gridTotalCount = totalCount;

        //-------------------------------------------------------
        //Styling
        let className, gridWidth = "unset", gridHeight = "unset";
        if (isNotEmptyString(maxGridWidth))
            gridWidth = maxGridWidth;
        if (isNotEmptyString(maxGridHeight))
            gridHeight = maxGridHeight;
        if (isNotEmptyString(gridContainerClass))
            className = gridContainerClass;


        let refreshLabel, exportLabel, labelAlign = {};
        if (isNullOrUndefined(showButtonLabels)) {
            refreshLabel = "Refresh";
            exportLabel = "Export";
            labelAlign["labelPosition"] = 'right';
        }

        //--------------------------------------------------------
        // Refresh, Export, and/or Total Count Panel
        let refreshExportTotalCountPanel;
        if (allowRefreshing || allowExporting || showTotalCount) {
            refreshExportTotalCountPanel = <div className={"refreshExportTotalPanel"}>
                {allowRefreshing === true && isNotAnEmptyArray(rows) &&
                <Button icon basic compact size='small'
                        onClick={refreshData}
                        {...labelAlign}>
                    <Icon name="refresh" color="blue"/>{refreshLabel}
                </Button>}

                {allowExporting && isNotAnEmptyArray(rows) &&
                <Button icon basic compact size='small'
                        onClick={exportData}
                        {...labelAlign}>
                    <Icon name="file excel outline"/>{exportLabel}
                </Button>}

                {showTotalCount !== false &&
                <h5 className={"totalText"}>Total: {gridTotalCount}</h5>}
            </div>
        }

        return (<div style={{fontSize: '12px', "--grid-max-width": gridWidth, "--grid-max-height": gridHeight, maxWidth: gridWidth, "--edit-field-height": editFieldsHeight}} className={className}>
            <Grid rows={rows}
                  columns={columns}
            >
                {/*----- Providers -----*/}
                {dragDropProvider}
                {typeProviders}

                {/* ---- States ----*/}
                {treeDataState}
                {rowDetailState}
                {searchState}
                {sortingState}
                {groupingState}
                {summaryState}
                {editingState}
                {pagingState}
                {selectionState}

                {/* ----- Integrated, Custom, and Plugins ----- */}

                {customTreeData}

                {integratedFiltering}
                {integratedSorting}
                {integratedGrouping}
                {summaryPlugin}
                {pagingPlugin}
                {integratedSelection}

                {/* ---- Main Table ----*/}
                <Table tableComponent={
                            ({...restProps}) => (
                                <Table.Table
                                    {...restProps}
                                    className="table-striped"
                                />
                            )
                        }
                       {...tableCellComponent}
                       {...tableColumnExtensions}
                />

                {tableColumnResizing}
                {tableColumnReordering}

                <TableHeaderRow {...tableHeaderRowProps} />
                {tableEditRow}
                {tableInlineCellEditing}

                {tableColumnVisibility}
                {tableTreeColumn}
                {tableEditColumn}
                {tableRowDetail}

                {tableGroupRow}
                {tableSummaryRow}
                {tableSelection}
                {toolbar}

                {/* ---- Panels ---- */}
                {searchPanel}
                {pagingPanel}
            </Grid>

            {/*--- Refresh, Export, and Total Panel ---*/}
            {refreshExportTotalCountPanel}

            {/*---- Delete Confirmation Popup ----*/}
            <PopupComponent header={"Confirmation"}
                            content={<Container>
                                <Row noGutters>
                                    <Col xs={2}><Image src={warningImg}/></Col>

                                    <Col xs={10} style={{margin: "auto"}}>
                                        <p style={{textAlign: 'center'}}>
                                            {isNotEmptyString(deleteConfirmationMessage) ? deleteConfirmationMessage : "Are you sure you want to delete this data?"}
                                        </p>
                                    </Col>
                                </Row>
                            </Container>
                            }
                            footerConfig={"custom"}
                            customFooter={
                                <Modal.Footer style={{padding: "5px"}}>
                                    <Button variant="success"
                                            style={{padding: "10px 15px"}}
                                            onClick={() => this.setState({
                                                showConfirmationPopup: false,
                                                confirmationMessage: "",
                                            }, () => {
                                                onCommitChanges(onCommitObj)
                                            })}
                                    >
                                        <FaCheck/> Yes
                                    </Button>

                                    <Button variant="secondary"
                                            style={{padding: "10px 15px"}}
                                            onClick={() => this.setState({
                                                showConfirmationPopup: false,
                                                confirmationMessage: "",
                                                onCommitObj: {}
                                            })}>
                                        <FaTimes/> No
                                    </Button>
                                </Modal.Footer>
                            }
                            closeToggled={value => value && this.setState({
                                showConfirmationPopup: false,
                                confirmationMessage: ""
                            })}
                            show={showConfirmationPopup}
                            hasBodyPadding={true}
            />
        </div>)
    }
}

export default GridComponent;

//--------- Cell Configurations For Different Data Types ------------
const numberEditorComponent = (gridEditFormat, restProps) => {
    let content = (value, onChangeCallback, restProps) => {
        const {column} = restProps;
        let origValue = restProps["row"][column.name];
        let placeholder = restProps["column"]["title"] ? restProps["column"]["title"] : "";

        let onSubmit;
        if (restProps["onSubmit"]) {
            onSubmit = () => {
                if (isNotEmptyString(value)) {
                    onChangeCallback(Number.parseFloat(value));
                } else {
                    onChangeCallback(null);
                }
                restProps["onSubmit"]();
            };
        }

        return <Form onSubmit={onSubmit} style={{fontSize: "12px"}}>
            <Form.Input
                placeholder={placeholder}
                type={"text"}
                autoFocus
                onKeyPress={allowNumbersOnly}
                fluid={true}
                onChange={
                    (e, {value}) => {
                        onChangeCallback(value);
                    }
                }
                onBlur={() => {
                    if (origValue !== value) {
                        if (isNotEmptyString(value)) {
                            onChangeCallback(Number.parseFloat(value));
                        } else {
                            onChangeCallback(null);
                        }
                    }
                }}
                value={value}
                className="gridInputField"
            />
        </Form>
    };

    if (gridEditFormat === "row") {
        const {value, onValueChange} = restProps;
        return content(value, onValueChange, restProps);
    } else {
        return getWrappedEditorComponent(content, restProps);
    }
}

const doubleEditorComponent = (gridEditFormat, restProps) => {
    let content = (value, onValueChange, restProps) => {
        const {column} = restProps;
        let origValue = restProps["row"][column.name];
        let placeholder = restProps["column"]["title"] ? restProps["column"]["title"] : "";
        let onSubmit;
        if (restProps["onSubmit"]) {
            onSubmit = () => {
                addDecimalIfApplicable(
                    value,
                    (e, {value}) => onValueChange(value)
                )
                restProps["onSubmit"]();
            };
        }

        return <Form onSubmit={onSubmit} style={{fontSize: '12px'}}>
            <Form.Input
                placeholder={placeholder}
                type={"text"}
                autoFocus
                fluid={true}
                onSubmit={onSubmit}
                onChange={
                    (e, {value}) =>
                        allowDoubleOnly(
                            e,
                            {value},
                            (e, {value}) => onValueChange(value)
                        )
                }
                value={value}
                onBlur={() => {
                    if (origValue != value) {
                        return addDecimalIfApplicable(value, (e, {value}) => onValueChange(value));
                    }
                }}
                className="gridInputField"
            />
        </Form>;
    }

    if (gridEditFormat === "row") {
        const {value, onValueChange} = restProps;
        return content(value, onValueChange, restProps);
    } else {
        return getWrappedEditorComponent(content, restProps);
    }
};

const dateEditorComponent = (gridEditFormat, restProps) => {
    let content = (value, onValueChange) => {
        return (<div className={"gridDatePicker"}>
            <DatePicker
                selected={
                    value ? new Date(Moment(value).format("MM/DD/YYYY")) : undefined
                }
                onChange={date => {
                    onValueChange(Moment(date).isValid() ? new Date(Moment(date).format("MM/DD/YYYY")) : undefined);
                }}
                dateFormat={"MM/dd/yyyy"}
                placeholderText="mm/dd/yyyy"
                isClearable
                showMonthDropdown
                showYearDropdown
                scrollableYearDropdown
                todayButton={"Today"}
                className="form-control w-100"
            />
        </div>)
    };

    if (gridEditFormat === "row") {
        const {value, onValueChange} = restProps;
        return content(value, onValueChange);
    } else {
        return getWrappedEditorComponent(content, restProps);
    }
};

const booleanEditorComponent = (gridEditFormat, restProps) => {
    let content = (value, onValueChange, restProps) => {
        const {column, editFieldsHeight, booleanOptions} = restProps;

        let dropdownOptions;
        if (isNotAnEmptyArray(booleanOptions)) {
            dropdownOptions = booleanOptions;
        } else {
            dropdownOptions = [
                {label: "Yes", value: true},
                {label: "No", value: false}
            ]
        }

        let filteredValue = dropdownOptions.filter(option => (option["value"] === value));

        const handleChange = (selectedOption) => {
            if (isNotNullNorUndefined(selectedOption))
                onValueChange(selectedOption.value);
            else
                onValueChange(null);
        };

        const gridDropdownHeight = editFieldsHeight ? editFieldsHeight : "25px";

        return <Select
            name={column.name}
            value={filteredValue}
            options={dropdownOptions}
            onChange={handleChange}
            hideSelectedOptions={false}
            styles={{
                control: (provided) => ({
                    ...provided,
                    height: gridDropdownHeight,
                    minHeight: gridDropdownHeight
                }),
                indicatorsContainer: (provided) => ({
                    ...provided,
                    height: gridDropdownHeight,
                    minHeight: gridDropdownHeight,
                    lineHeight: gridDropdownHeight
                }),
                placeholder: (provided) => ({
                    ...provided,
                    height: gridDropdownHeight,
                    minHeight: gridDropdownHeight,
                    lineHeight: gridDropdownHeight,
                    marginLeft: 0
                }),
                menu: (provided) => ({...provided, lineHeight: 1, zIndex: 1000}),
                singleValue: (provided) => ({
                    ...provided,
                    height: gridDropdownHeight,
                    minHeight: gridDropdownHeight,
                    lineHeight: gridDropdownHeight,
                    marginLeft: 0
                }),
                valueContainer: (provided) => ({
                    ...provided,
                    height: gridDropdownHeight,
                    minHeight: gridDropdownHeight,
                    maxHeight: gridDropdownHeight,
                    justifyContent: "flex-start",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    flexWrap: "initial"
                })
            }}
        />;
    }

    if (gridEditFormat === "row") {
        const {value, onValueChange} = restProps;
        return content(value, onValueChange, restProps);
    } else {
        return getWrappedEditorComponent(content, restProps);
    }
};

const dropdownEditorComponent = (gridEditFormat, restProps) => {
    let content = (value, onValueChange, restProps) => {
        const {column, dropdownColumns, editFieldsHeight} = restProps;
        const {isClearable, menuConfig, dropdown} = dropdownColumns[column.name];

        const handleChange = (selectedOption) => {
            if (isNotNullNorUndefined(selectedOption))
                onValueChange(selectedOption.value);
            else
                onValueChange(null);
        };

        const gridDropdownHeight = editFieldsHeight ? editFieldsHeight : "25px";

        if (typeof dropdownColumns[column.name]["dropdown"] === "function") {
            const optionProps = {
                isAGridDropdown: true,
                gridDropdownHeight,
                currentField: column.name,
                formFieldsData: {
                    [column.name]: value
                },
                handlerFunction: handleChange,
                allowMultiSelect: false,
                isClearable,
                menuConfig
            }

            return dropdown(optionProps)
        } else {
            let filteredValue = dropdown.filter(option => (option["value"] === value));

            return <Select
                name={column.name}
                value={filteredValue || null}
                options={dropdown}
                isClearable={isClearable}
                onChange={handleChange}
                isMulti={false}
                closeMenuOnSelect={true}
                hideSelectedOptions={false}
                styles={{
                    control: (provided) => ({
                        ...provided,
                        height: gridDropdownHeight,
                        minHeight: gridDropdownHeight
                    }),
                    indicatorsContainer: (provided) => ({
                        ...provided,
                        height: gridDropdownHeight,
                        minHeight: gridDropdownHeight,
                        lineHeight: gridDropdownHeight
                    }),
                    menu: menuConfig,
                    placeholder: (provided) => ({
                        ...provided,
                        height: gridDropdownHeight,
                        minHeight: gridDropdownHeight,
                        lineHeight: gridDropdownHeight,
                        marginLeft: 0
                    }),
                    singleValue: (provided) => ({
                        ...provided,
                        height: gridDropdownHeight,
                        minHeight: gridDropdownHeight,
                        lineHeight: gridDropdownHeight,
                        marginLeft: 0
                    }),
                    valueContainer: (provided) => ({
                        ...provided,
                        height: gridDropdownHeight,
                        minHeight: gridDropdownHeight,
                        maxHeight: gridDropdownHeight,
                        justifyContent: "flex-start",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        flexWrap: "initial"
                    })
                }}
            />;
        }
    }

    if (gridEditFormat === "row") {
        const {value, onValueChange} = restProps;
        return content(value, onValueChange, restProps);
    } else {
        return getWrappedEditorComponent(content, restProps);
    }
};

//----------- Returning TableCell Editor With "Update" & "Cancel" Buttons For gridEditFormat = "cell" ----------------------
const getWrappedEditorComponent = (content, restProps) => {
    const {value, onValueChange, onBlur} = restProps;

    const [isOpen, setOpen] = useState(true);
    const [formValue, setFormValue] = useState(value);
    const [sendNewValue, setSendNewValue] = useState(false);
    const [closeEditMode, setCloseEditMode] = useState(false);

    useEffect(() => {
        if (sendNewValue) {
            if (value !== formValue) {
                onValueChange(formValue);
            }

            setCloseEditMode(true);
        }

        if (closeEditMode) {
            onBlur();
        }
    }, [sendNewValue, closeEditMode])

    return (
        <Popup on='click'
               pinned
               position='bottom'
               open={isOpen}
               onOpen={() => setOpen(true)}
               style={{zIndex: "999", padding: '8px'}}
               offset={[10, -5]}
               trigger={
                   content(
                       formValue, setFormValue, {...restProps, onSubmit: () => setSendNewValue(true)}
                   )
               }
        >
            <Button onClick={() => setSendNewValue(true)} compact size='small'>Update</Button>
            <Button onClick={() => setCloseEditMode(true)} compact size='small'>Cancel</Button>
        </Popup>
    )
}

//--------------------- Helper Methods ------------------------------
const allowNumbersOnly = (e) => {
    let code = (e.which) ? e.which : e.keyCode;
    if (code > 31 && (code < 48 || code > 57)) {
        e.preventDefault();
    }
}

const allowDoubleOnly = (e, {value}, handlerFunction) => {
    if (!value || value.match(/^\d*\.?\d{0,2}$/)) {
        handlerFunction(e, {value});
    } else {
        e.preventDefault();
    }
}

const addDecimalIfApplicable = (value, handlerFunction) => {
    if (isNotNullNorUndefined(value) && !Number.isNaN(Number.parseFloat(value.toString()))) {
        if (value.toString().match(/\d+\.\d(?!\d)/)) {
            let refactoredValue = {value: Number.parseFloat(value.toString() + "0")};
            handlerFunction({}, refactoredValue);
        } else if (value.toString().match(/\d+\.(?!\d)/)) {
            let refactoredValue = {value: Number.parseFloat(value.toString() + "00")};
            handlerFunction({}, refactoredValue);
        } else if (!value.toString().match(/\d+\.\d\d(?!\d)/)) {
            let refactoredValue = {value: Number.parseFloat(value.toString() + ".00")};
            handlerFunction({}, refactoredValue);
        } else {
            handlerFunction({}, {value: Number.parseFloat(value.toString())});
        }
    } else {
        handlerFunction({}, {value: null})
    }
}

//--------------------- Prop Types ------------------------------
GridComponent.propTypes = {
    //-------------------------------------------------------
    //Required
    columns: PropTypes.arrayOf(PropTypes.exact({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        type: PropTypes.oneOf([
            'number', 'currency', 'date'
        ]),
    })).isRequired,

    rows: PropTypes.arrayOf(
        PropTypes.objectOf(
            PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ])
        )
    ).isRequired,

    //-------------------------------------------------------
    //Data Formatting
    isTreeData: PropTypes.bool,

    //-------------------------------------------------------
    //Column Formatting
    columnWidths: PropTypes.objectOf(PropTypes.number),
    allowColumnReorder: PropTypes.bool,
    hiddenColumns: PropTypes.arrayOf(PropTypes.string),

    //-------------------------------------------------------
    //Table-Cell Formatting
    tableCellConfig: PropTypes.shape({
        onClick: PropTypes.func,
        style: PropTypes.object,
        renderedComponent: PropTypes.element
    }),

    //-------------------------------------------------------
    //Row Formatting
    allowRowDetail: PropTypes.bool,
    rowDetailContent: PropTypes.func,

    //-------------------------------------------------------
    //Filtering
    allowFiltering: PropTypes.bool,

    //-------------------------------------------------------
    //Grouping
    allowGrouping: PropTypes.bool,
    grouping: PropTypes.string,
    expandGroupsByDefault: PropTypes.bool,
    hideColumnNameInGrouping: PropTypes.bool,
    showGroupCount: PropTypes.bool,

    //-------------------------------------------------------
    //Summarizing
    allowSummarizing: PropTypes.bool,
    summaryItems: PropTypes.arrayOf(
        PropTypes.exact({
            columnName: PropTypes.string,
            type: PropTypes.oneOf(['sum', 'max', 'min', 'avg', 'count'])
        })
    ),
    summaryItemLabels: PropTypes.object,
    customSummaries: PropTypes.arrayOf(PropTypes.number),

    //-------------------------------------------------------
    //Selecting
    allowSelections: PropTypes.bool,
    selections: PropTypes.array,
    changeSelections: PropTypes.func,
    showSelectAll: PropTypes.bool,
    selectByRowClick: PropTypes.bool,

    //-------------------------------------------------------
    //Data Modifications
    allowCreating: PropTypes.bool,
    allowEditing: PropTypes.bool,
    allowDeleting: PropTypes.bool,

    onCommitChanges: PropTypes.func,

    editConfig: PropTypes.shape({
        editFormat: PropTypes.oneOf([
            'row', 'cell', 'external'
        ]),
        fields: PropTypes.object,
        fieldsHeight: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        selectTextOnEditStart: PropTypes.bool,
        startEditAction: PropTypes.oneOf(['click', 'doubleClick'])
    }),
    showDeleteConfirmation: PropTypes.bool,
    deleteConfirmationMessage: PropTypes.string,

    //-------------------------------------------------------
    //Paging
    showPagingPanel: PropTypes.bool,
    pageSizes: PropTypes.arrayOf(PropTypes.number),
    allowRemotePaging: PropTypes.bool,
    currentPage: PropTypes.number,
    changeCurrentPage: PropTypes.func,
    pageSize: PropTypes.number,
    changePageSize: PropTypes.func,
    totalCount: PropTypes.number,

    //-------------------------------------------------------
    //Sorting
    allowSorting: PropTypes.bool,
    allowRemoteSorting: PropTypes.bool,
    sorting: PropTypes.arrayOf(
        PropTypes.exact({
            columnName: PropTypes.string,
            direction: PropTypes.oneOf(['asc', 'desc'])
        })
    ),
    changeSorting: PropTypes.func,
    columnsSorting: PropTypes.arrayOf(
        PropTypes.exact({
            columnName: PropTypes.string,
            compare: PropTypes.func
        })
    ),

    //-------------------------------------------------------
    //Refreshing
    allowRefreshing: PropTypes.bool,
    refreshData: PropTypes.func,

    //-------------------------------------------------------
    //Exporting
    allowExporting: PropTypes.bool,
    exportData: PropTypes.func,

    //-------------------------------------------------------
    //Total Count
    showTotalCount: PropTypes.bool,

    //-------------------------------------------------------
    //Styling
    gridContainerClass: PropTypes.string,
    maxGridWidth: PropTypes.string,
    maxGridHeight: PropTypes.string,

    showButtonLabels: PropTypes.bool
}