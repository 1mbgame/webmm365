/**
 * @author Andy Ng
 * @version 1.3
 * @description
 * Simple database ORM, fast and high security
 * 
 */
export class AndyORM {

    constructor() {

        this.initMultiQuery();
        this.init();
    }

    private tableName: string;
    public maxRecord: number;
    public parameterList: any[];
    private sqlString: string;
    private sqlTable: string;
    private sqlSelect: string[];
    private sqlWhere: Where[];
    private sqlOrderBy: OrderBy[];
    private sqlGroupBy: GroupBy[];
    private sqlHaving: Having[];
    private sqlJoin: Join[];
    private offsetLimit: Limit;

    // for multi query
    public multiQuery: any;
    public multiQueryHasParameterize:boolean = false;
    private multiQueryIndex: number;
    private multiQueryName: string;


    public init() {

        this.maxRecord = 1000;
        this.parameterList = [];
        this.sqlString = "";
        this.sqlTable = "";
        this.sqlSelect = [];
        this.tableName = "";
        this.sqlWhere = [];
        this.sqlOrderBy = [];
        this.sqlGroupBy = [];
        this.sqlHaving = [];
        this.sqlJoin = [];
        this.offsetLimit = null;



    }

    public initMultiQuery() {
        this.multiQuery = {};
        this.multiQueryIndex = 0;
        this.multiQueryName = "";
    }

    public table(tableName: string): AndyORM {
        this.init();
        this.tableName = tableName;
        this.sqlTable = "FROM `" + tableName + "` ";
        return this;
    }

    public select(...selectString: string[]): AndyORM {

        for (let key in selectString) {
            this.sqlSelect.push(selectString[key]);
        }
        return this;

    }

    public selectDistinct(field: string) {
        this.sqlSelect.push("DISTINCT " + field + " ");
    }

    public whereEqual(field: string, value: any): AndyORM {
        let where: Where = new Where();
        where.type = 'AND';
        where.field = field;
        where.operator = '=';
        where.value = value;
        this.sqlWhere.push(where);

        return this;
    }

    public where(field: string, operator: string, value: any): AndyORM {
        let where: Where = new Where();
        where.type = 'AND';
        where.field = field;
        where.operator = operator;
        where.value = value;
        this.sqlWhere.push(where);

        return this;
    }

    public orWhere(field: string, operator: string, value: any): AndyORM {
        let where: Where = new Where();
        where.type = 'OR';
        where.field = field;
        where.operator = operator;
        where.value = value;
        this.sqlWhere.push(where);

        return this;
    }

    public whereNot(field: string, operator: string, value: any): AndyORM {
        let where: Where = new Where();
        where.type = 'NOT';
        where.field = field;
        where.operator = operator;
        where.value = value;
        this.sqlWhere.push(where);

        return this;
    }

    public whereIn(field: string, values: any[]): AndyORM {

        let value: string = '( ';

        for (let key in values) {
            value += "?,"
        }
        value = value.substring(0, value.length - 1);
        value += ' )';

        let where: Where = new Where();
        where.type = 'whereIn';
        where.field = field;
        where.operator = 'IN';
        where.value = value;
        where.value2 = values;
        this.sqlWhere.push(where);


        return this;
    }

    public whereNotIn(field: string, values: any[]): AndyORM {

        let value: string = '(';

        for (let key in values) {
            value += "?,"
        }
        value = value.substring(0, value.length - 1);
        value += ')';

        let where: Where = new Where();
        where.type = 'whereIn';
        where.field = field;
        where.operator = 'NOT IN';
        where.value = value;
        where.value2 = values;
        this.sqlWhere.push(where);


        return this;
    }

    public whereBetween(field: string, minValue: any, maxValue: any): AndyORM {
        let where: Where = new Where();
        where.type = 'whereBetween';
        where.field = field;
        where.operator = 'BETWEEN';
        where.value = minValue;
        where.value2 = maxValue;
        this.sqlWhere.push(where);

        return this;
    }

    public whereNotBetween(field: string, minValue: any, maxValue: any): AndyORM {
        let where: Where = new Where();
        where.type = 'whereBetween';
        where.field = field;
        where.operator = ' NOT BETWEEN ';
        where.value = minValue;
        where.value2 = maxValue;
        this.sqlWhere.push(where);

        return this;
    }

    public whereNull(field: string): AndyORM {
        let where: Where = new Where();
        where.type = 'whereNull';
        where.field = field;
        where.operator = ' IS NULL ';
        where.value = '';
        where.value2 = '';
        this.sqlWhere.push(where);

        return this;
    }

    public whereNotNull(field: string): AndyORM {
        let where: Where = new Where();
        where.type = 'whereNull';
        where.field = field;
        where.operator = ' IS NOT NULL ';
        where.value = '';
        where.value2 = '';
        this.sqlWhere.push(where);

        return this;
    }

    public whereDate(field: string, operator: string, value: string): AndyORM {
        let where: Where = new Where();
        where.type = 'whereDate';
        where.field = field;
        where.operator = operator;
        where.value = value;
        where.value2 = 'DATE';
        this.sqlWhere.push(where);

        return this;
    }

    public whereYear(field: string, operator: string, value: string): AndyORM {
        let where: Where = new Where();
        where.type = 'whereDate';
        where.field = field;
        where.operator = operator;
        where.value = value;
        where.value2 = 'YEAR';
        this.sqlWhere.push(where);

        return this;
    }

    public whereMonth(field: string, operator: string, value: string): AndyORM {
        let where: Where = new Where();
        where.type = 'whereDate';
        where.field = field;
        where.operator = operator;
        where.value = value;
        where.value2 = 'MONTH';
        this.sqlWhere.push(where);

        return this;
    }

    public whereDay(field: string, operator: string, value: string): AndyORM {
        let where: Where = new Where();
        where.type = 'whereDate';
        where.field = field;
        where.operator = operator;
        where.value = value;
        where.value2 = 'DAY';
        this.sqlWhere.push(where);

        return this;
    }

    public whereHour(field: string, operator: string, value: string): AndyORM {
        let where: Where = new Where();
        where.type = 'whereDate';
        where.field = field;
        where.operator = operator;
        where.value = value;
        where.value2 = 'HOUR';
        this.sqlWhere.push(where);

        return this;
    }

    public whereMinute(field: string, operator: string, value: string): AndyORM {
        let where: Where = new Where();
        where.type = 'whereDate';
        where.field = field;
        where.operator = operator;
        where.value = value;
        where.value2 = 'MINUTE';
        this.sqlWhere.push(where);

        return this;
    }

    public whereSecond(field: string, operator: string, value: string): AndyORM {
        let where: Where = new Where();
        where.type = 'whereDate';
        where.field = field;
        where.operator = operator;
        where.value = value;
        where.value2 = 'SECOND';
        this.sqlWhere.push(where);

        return this;
    }

    public groupBy(field: string): AndyORM {
        let groupBy: GroupBy = new GroupBy;
        groupBy.field = field;
        groupBy.sequence = '';

        this.sqlGroupBy.push(groupBy);

        return this;
    }

    public having(field: string, operator: string, value: string): AndyORM {
        let having: Having = new Having();
        having.condition = "AND";
        having.field = field;
        having.operator = operator;
        having.value = value;

        this.sqlHaving.push(having);

        return this;
    }

    public orHaving(field: string, operator: string, value: string): AndyORM {
        let having: Having = new Having();
        having.condition = "OR";
        having.field = field;
        having.operator = operator;
        having.value = value;

        this.sqlHaving.push(having);

        return this;
    }

    public offset(value: number): AndyORM {
        if (this.offsetLimit == null) {
            this.offsetLimit = new Limit();
        }

        this.offsetLimit.offset = value;

        return this;
    }

    public limit(value: number): AndyORM {
        if (this.offsetLimit == null) {
            this.offsetLimit = new Limit();
            this.offsetLimit.offset = 0;
        }

        this.offsetLimit.limit = value;

        return this;
    }

    public orderBy(field: string, value: string): AndyORM {
        let orderType: string = '';
        if (value.toUpperCase() == "ASC") {
            orderType = "ASC";
        } else {
            orderType = "DESC";
        }

        let orderBy: OrderBy = new OrderBy();
        orderBy.field = field;
        orderBy.value = value;

        this.sqlOrderBy.push(orderBy);

        return this;
    }

    public orderByAsc(field: string): AndyORM {
        let orderBy: OrderBy = new OrderBy();
        orderBy.field = field;
        orderBy.value = "ASC";

        this.sqlOrderBy.push(orderBy);
        return this;
    }

    public orderByDesc(field: string): AndyORM {
        let orderBy: OrderBy = new OrderBy();
        orderBy.field = field;
        orderBy.value = "DESC";

        this.sqlOrderBy.push(orderBy);
        return this;
    }

    /**
     * 
     * @param andyOrm 
     * 
     * @description
     * 
     * "andyOrm" must be new instance
     * @example
     * .table(tableName)
     * .encloseWhere(
     *      (new AndyORM)
     *      .orWhere('item1','!=','0')
     *      .orWhere('item2','!=','0')
     *  );
     * 
     */
    public encloseWhere(andyOrm: AndyORM): AndyORM {

        let value: string = andyOrm.getWhereLogic(andyOrm.getSqlWhere());
        value = "AND (" + value.substring(5) + ") ";

        let where: Where = new Where();
        where.type = "enclose";
        where.field = "";
        where.operator = "";
        where.value = value;
        where.value2 = andyOrm.parameterList;

        this.sqlWhere.push(where);

        return this;
    }

    /**
   * 
   * @param andyOrm 
   * 
   * @description
   * "andyOrm" must be new instance
   * @example
   * .table(tableName)
   * .encloseWhere(
   *      (new AndyORM)
   *      .orWhere('item1','!=','0')
   *      .orWhere('item2','!=','0')
   *  );
   * 
   */
    public encloseOrWhere(andyOrm: AndyORM): AndyORM {

        let value: string = andyOrm.getWhereLogic(andyOrm.getSqlWhere());
        value = "OR (" + value.substring(5) + ") ";

        let where: Where = new Where();
        where.type = "enclose";
        where.field = "";
        where.operator = "";
        where.value = value;
        where.value2 = andyOrm.parameterList;

        this.sqlWhere.push(where);


        return this;
    }



    public getSqlWhere(): Where[] {

        return this.sqlWhere;

    }

    public getSqlString(): string {
        return this.sqlString;
    }

    public getSqlStringWithoutParameterize(): string {
        let sqlQuery = this.sqlString;

        for (let key in this.parameterList) {
            let type: string = typeof (this.parameterList[key]);
            if (type == 'boolean') {
                sqlQuery = sqlQuery.replace('?', (this.parameterList[key] == true ? "1" : "0"));
            } else if (type == 'number') {
                sqlQuery = sqlQuery.replace('?', this.parameterList[key]);
            } else {
                sqlQuery = sqlQuery.replace('?', "'" + this.parameterList[key] + "'");
            }
        }
        return sqlQuery;
    }

    private getSelectLogic(sqlSelect: string[]): string {
        if (sqlSelect.length <= 0) {
            return 'SELECT * ';
        }

        let selectString: string = 'SELECT ';

        let total: number = sqlSelect.length;
        for (let index = 0; index < total; index++) {
            selectString += sqlSelect[index] + ',';
        }

        selectString = selectString.substring(0, selectString.length - 1);
        selectString += ' ';

        return selectString;
    }

    private getWhereLogic(sqlWhere: Where[]): string {
        let sqlQuery = '';

        if (sqlWhere.length > 0) {
            sqlQuery += "WHERE ";
            let i = 0;
            for (let key in sqlWhere) {
                let whereLogic = "";
                if (sqlWhere[key].type == 'enclose') {
                    sqlQuery += sqlWhere[key].value;
                    // concat all array data
                    let whereInValues = sqlWhere[key].value2;
                    console.log('----->');
                    console.log(whereInValues);
                    for (let index in whereInValues) {
                        this.parameterList.push(whereInValues[index]);
                    }

                    i++;
                    continue;
                }
                if (sqlWhere[key].type == 'whereIn') {
                    if (i > 0) {
                        whereLogic += 'AND ';
                    }

                    whereLogic += sqlWhere[key].field + " " + sqlWhere[key].operator;
                    whereLogic += " " + sqlWhere[key].value + " ";
                    let whereInValues = sqlWhere[key].value2;
                    for (let index in whereInValues) {
                        this.parameterList.push(whereInValues[index]);
                    }

                    sqlQuery += whereLogic;
                    i++;
                    continue;
                }
                if (sqlWhere[key].type == 'whereBetween') {

                    if (i > 0) {
                        whereLogic += "AND ( ";
                    }
                    whereLogic += sqlWhere[key].field + " " + sqlWhere[key].operator;
                    whereLogic += " ? AND ? ) ";
                    this.parameterList.push(sqlWhere[key].value);
                    this.parameterList.push(sqlWhere[key].value2);
                    sqlQuery += whereLogic;
                    i++;
                    continue;
                }
                if (sqlWhere[key].type == 'whereNull') {
                    if (i > 0) {
                        whereLogic += "AND ";
                    }
                    whereLogic += sqlWhere[key].field + " " + sqlWhere[key].operator;
                    sqlQuery += whereLogic;
                    i++;
                    continue;
                }
                if (sqlWhere[key].type == 'whereDate') {
                    if (i > 0) {
                        whereLogic += "AND ";
                    }
                    whereLogic += sqlWhere[key].value2 + '(' + sqlWhere[key].field + ') ' + sqlWhere[key].operator + ' ? ';
                    sqlQuery += whereLogic;
                    this.parameterList.push(sqlWhere[key].value);
                    i++;
                    continue;
                }

                if (i <= 0) {
                    i++;
                } else {
                    whereLogic += sqlWhere[key].type + " ";
                }
                whereLogic += sqlWhere[key].field + " " + sqlWhere[key].operator;
                whereLogic += " ? ";
                this.parameterList.push(sqlWhere[key].value);

                sqlQuery += whereLogic;
            }

            return sqlQuery;
        }

        return sqlQuery;
    }

    private getJoinLogic(sqlJoin: Join[]): string {
        if (sqlJoin.length == 0) {
            return "";
        }
        let sqlQuery: string = '';

        for (let key in sqlJoin) {
            sqlQuery += sqlJoin[key].joinMethod
                + sqlJoin[key].joinTable
                + " ON " + sqlJoin[key].tableField
                + " " + sqlJoin[key].operator + " "
                + " " + sqlJoin[key].joinTableField + " ";

        }

        return sqlQuery;

    }

    private getOrderByLogic(sqlOrderBy: OrderBy[]): string {
        if (sqlOrderBy.length == 0) {
            return "";
        }

        let sqlQuery: string = "";
        let ascFields: string[] = [];
        let descFields: string[] = [];

        let ascField = "ORDER BY ";
        let descField = "ORDER BY ";

        for (let key in sqlOrderBy) {
            if (sqlOrderBy[key].value.toUpperCase() == "ASC") {
                ascFields.push(sqlOrderBy[key].field);
            }
            if (sqlOrderBy[key].value.toUpperCase() == "DESC") {
                descFields.push(sqlOrderBy[key].field);
            }
        }

        ascField += ascFields.join(", ");
        descField += descFields.join(", ");

        if (sqlOrderBy[0].value == "ASC") {
            sqlQuery += ascField + " ASC";
        } else {
            sqlQuery += descField + " DESC";
        }

        return sqlQuery;
    }

    private getGroupByLogic(sqlGroupBy: GroupBy[]): string {
        if (sqlGroupBy.length == 0) {
            return "";
        }

        let groupFields: string[] = [];
        for (let key in sqlGroupBy) {
            groupFields.push(sqlGroupBy[key].field);
        }

        let sqlQuery: string = "";
        sqlQuery = " GROUP BY " + groupFields.join(",") + " ";

        return sqlQuery;

    }

    private getHavingLogic(sqlHaving: Having[]): string {

        if (sqlHaving.length == 0) {
            return "";
        }
        let sqlQuery = " HAVING ";

        let i: number = 0;
        for (let key in sqlHaving) {
            if (i == 0) {
                i++;
            } else {
                sqlQuery += " " + sqlHaving[key].condition + " ";
            }
            sqlQuery = sqlHaving[key].field + " " + sqlHaving[key].operator + " ? ";
            this.parameterList.push(sqlHaving[key].value);
        }
        return sqlQuery;
    }

    private getOffsetLimitLogic(offsetLimit: Limit): string {
        if (offsetLimit == null) {
            return "";
        }
        let sqlQuery: string = "";
        if (offsetLimit.limit > 0) {
            sqlQuery = " LIMIT " + offsetLimit.offset + "," + offsetLimit.limit + " ";
        } else if (offsetLimit.limit == 0 && offsetLimit.offset > 0) {
            sqlQuery = " LIMIT " + offsetLimit.offset + "," + this.maxRecord + " ";
        }

        return sqlQuery;

    }


    public setQueryName(queryName: string) {
        this.multiQueryName = queryName;
    }

    private configureMultiQuery(queryType: string) {
        let jsonMultiQueryName: string = '';
        if (this.multiQueryName == '' || this.multiQuery.hasOwnProperty(this.multiQueryName) == true) {
            jsonMultiQueryName = 'query-' + this.multiQueryIndex;
            this.multiQueryIndex += 1;
        } else {
            jsonMultiQueryName = this.multiQueryName;
        }


        this.multiQuery[jsonMultiQueryName] = {};
        this.multiQuery[jsonMultiQueryName][queryType] = [];
        this.multiQuery[jsonMultiQueryName][queryType] = {};
        this.multiQuery[jsonMultiQueryName][queryType]['tableName'] = this.tableName;
        if(this.multiQueryHasParameterize){
            // for (let key in this.parameterList) {
            //     if(this.parameterList[key] == true){
            //         this.parameterList[key] = 1;
            //     }else if(this.parameterList[key] == false){
            //         this.parameterList[key] = 0;
            //     }
            // }
            this.multiQuery[jsonMultiQueryName][queryType]['query'] = this.sqlString;
            this.multiQuery[jsonMultiQueryName][queryType]['parameterList'] = this.parameterList;
        }else{
            this.multiQuery[jsonMultiQueryName][queryType]['query'] = this.getSqlStringWithoutParameterize();
            this.multiQuery[jsonMultiQueryName][queryType]['parameterList'] = [];
        }
        
    }

    public get() {

        this.sqlString = this.getSelectLogic(this.sqlSelect)
            + this.sqlTable
            + this.getJoinLogic(this.sqlJoin)
            + this.getWhereLogic(this.sqlWhere)
            + this.getGroupByLogic(this.sqlGroupBy)
            + this.getHavingLogic(this.sqlHaving)
            + this.getOrderByLogic(this.sqlOrderBy)
            + this.getOffsetLimitLogic(this.offsetLimit);
        this.sqlString += ";";

        this.configureMultiQuery('get');

        return this.sqlString;
    }

    public sum(field: string): string {

        this.sqlString = "SELECT SUM(" + field + ") "
            + this.sqlTable
            + this.getWhereLogic(this.sqlWhere)
            + this.getGroupByLogic(this.sqlGroupBy)
            + this.getHavingLogic(this.sqlHaving);
        this.sqlString += ";";

        this.configureMultiQuery('sum');

        return this.sqlString;
    }

    public count(field: string = ''): string {

        if (field == '') {
            field = '*';
        }
        this.sqlString = "SELECT COUNT(" + field + ") "
            + this.sqlTable
            + this.getWhereLogic(this.sqlWhere)
            + this.getGroupByLogic(this.sqlGroupBy)
            + this.getHavingLogic(this.sqlHaving);

        if (this.sqlGroupBy.length > 0) {
            this.sqlString = this.sqlString.replace(";", "");

            this.sqlString = "SELECT COUNT(*) FROM ("
                + this.sqlString
                + ") selectCount;";
        }

        this.configureMultiQuery('sum');

        return this.sqlString;

    }

    public avg(field: string): string {

        this.sqlString = "SELECT AVG(" + field + ") "
            + this.sqlTable
            + this.getWhereLogic(this.sqlWhere);

        this.configureMultiQuery('avg');

        return this.sqlString
    }

    public min(field: string): string {

        this.sqlString = "SELECT MIN(" + field + ") "
            + this.sqlTable
            + this.getWhereLogic(this.sqlWhere);

        this.configureMultiQuery('min');

        return this.sqlString
    }

    public max(field: string): string {

        this.sqlString = "SELECT MAX(" + field + ") "
            + this.sqlTable
            + this.getWhereLogic(this.sqlWhere);

        this.configureMultiQuery('max');

        return this.sqlString
    }

    public insert(value: any): string {

        let columnList: string[] = [];
        let columnValues: any[] = [];

        for (let key in value) {
            columnList.push(key);
            columnValues.push(' ? ');
            this.parameterList.push(value[key]);
        }

        this.sqlString = "INSERT INTO `"
            + this.tableName
            + "` (" + columnList.join(',') + ") "
            + "VALUES (" + columnValues.join(',') + ") ;";

        this.configureMultiQuery('insert');

        return this.sqlString;
    }

    public insertMultiple(aryData: any[]) {
        let columnList: string[] = [];
        let columnValues: any[] = [];

        for (let key in aryData[0]) {
            columnList.push(key);
            columnValues.push(' ? ');

        }

        this.sqlString = "INSERT INTO `"
            + this.tableName
            + "` (" + columnList.join(',') + ") "
            + "VALUES (" + columnValues.join(',') + ") ;";


        let parameters: any[] = [];
        for (let index in aryData) {
            parameters = [];
            for (let key in aryData[index]) {
                parameters.push(aryData[index][key]);
            }
            this.parameterList.push(parameters);
        }

        this.configureMultiQuery('insertMultiple');

    }

    public insertGetId(value: any) {
        let columnList: string[] = [];
        let columnValues: any[] = [];

        for (let key in value) {
            columnList.push(key);
            columnValues.push(' ? ');
            this.parameterList.push(value[key]);
        }

        this.sqlString = "INSERT INTO `"
            + this.tableName
            + "` (" + columnList.join(',') + ") "
            + "VALUES (" + columnValues.join(',') + ") ;";

        this.configureMultiQuery('insertGetId');

        return this.sqlString;
    }

    public update(value: any) {
        let columnList: string[] = [];

        for (let key in value) {
            columnList.push(key + ' = ? ');
            this.parameterList.push(value[key]);
        }

        this.sqlString = "UPDATE `"
            + this.tableName
            + "` SET " + columnList.join(', ')
            + this.getWhereLogic(this.sqlWhere)
            + this.getOffsetLimitLogic(this.offsetLimit);

        this.configureMultiQuery('update');

        return this.sqlString;
    }

    public delete() {

        this.sqlString = "DELETE FROM `"
            + this.tableName + "` "
            + this.getWhereLogic(this.sqlWhere)
            + this.getOffsetLimitLogic(this.offsetLimit);

        this.configureMultiQuery('delete');

        return this.sqlString;

    }

    public join(joinTable: string, tableField: string, operator: string, joinTableField: string) {
        let join: Join = new Join();
        join.joinMethod = ' INNER JOIN ';
        join.joinTable = joinTable;
        join.tableField = tableField;
        join.operator = operator;
        join.joinTableField = joinTableField;

        this.sqlJoin.push(join);

        return this;
    }

    public leftJoin(joinTable: string, tableField: string, operator: string, joinTableField: string) {
        let join: Join = new Join();
        join.joinMethod = ' LEFT JOIN ';
        join.joinTable = joinTable;
        join.tableField = tableField;
        join.operator = operator;
        join.joinTableField = joinTableField;

        this.sqlJoin.push(join);

        return this;
    }

    public rightJoin(joinTable: string, tableField: string, operator: string, joinTableField: string) {
        let join: Join = new Join();
        join.joinMethod = ' RIGHT JOIN ';
        join.joinTable = joinTable;
        join.tableField = tableField;
        join.operator = operator;
        join.joinTableField = joinTableField;

        this.sqlJoin.push(join);

        return this;
    }

    public fullJoin(joinTable: string, tableField: string, operator: string, joinTableField: string) {
        let join: Join = new Join();
        join.joinMethod = ' FULL OUTER JOIN ';
        join.joinTable = joinTable;
        join.tableField = tableField;
        join.operator = operator;
        join.joinTableField = joinTableField;

        this.sqlJoin.push(join);

        return this;
    }


}


class Where {
    public type: any;
    public field: string;
    public operator: string;
    public value: any;
    public value2: any;
}

class OrderBy {
    public field: string;
    public value: string;
}

class GroupBy {
    public field: string;
    public sequence: string;
}

class Having {
    public condition: string;
    public field: string;
    public operator: string;
    public value: string;

}

class Limit {
    public limit: number;
    public offset: number;
}

class Join {
    public joinMethod: string;
    public joinTable: string;
    public tableField: string;
    public operator: string;
    public joinTableField: string;
}