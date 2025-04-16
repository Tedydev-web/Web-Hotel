using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataBase.Data.Migrations
{
    public partial class init : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "PriceDiscount",
                table: "ServiceRoom",
                type: "decimal(19,2)",
                nullable: true,
                defaultValueSql: "0",
                oldClrType: typeof(decimal),
                oldType: "decimal(19,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "ServiceRoom",
                type: "decimal(19,2)",
                nullable: false,
                defaultValueSql: "0",
                oldClrType: typeof(decimal),
                oldType: "decimal(19,2)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartAt",
                table: "Discount",
                type: "datetime",
                nullable: false,
                defaultValueSql: "getdate()",
                oldClrType: typeof(DateTime),
                oldType: "datetime");

            migrationBuilder.AlterColumn<decimal>(
                name: "DiscountPercent",
                table: "Discount",
                type: "decimal(19,2)",
                nullable: false,
                defaultValueSql: "0",
                oldClrType: typeof(decimal),
                oldType: "decimal(19,2)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "PriceDiscount",
                table: "ServiceRoom",
                type: "decimal(19,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(19,2)",
                oldNullable: true,
                oldDefaultValueSql: "0");

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "ServiceRoom",
                type: "decimal(19,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(19,2)",
                oldDefaultValueSql: "0");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartAt",
                table: "Discount",
                type: "datetime",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldDefaultValueSql: "getdate()");

            migrationBuilder.AlterColumn<decimal>(
                name: "DiscountPercent",
                table: "Discount",
                type: "decimal(19,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(19,2)",
                oldDefaultValueSql: "0");
        }
    }
}
