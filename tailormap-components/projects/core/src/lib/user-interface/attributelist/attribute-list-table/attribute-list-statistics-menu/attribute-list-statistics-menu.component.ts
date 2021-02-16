import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { StatisticType } from '../../../../shared/statistic-service/statistic-models';
import { StatisticTypeInMenu } from '../../attributelist-common/attributelist-statistic-models';
import { AttributelistStatistic } from '../../attributelist-common/attributelist-statistic';

@Component({
  selector: 'tailormap-attribute-list-statistics-menu',
  templateUrl: './attribute-list-statistics-menu.component.html',
  styleUrls: ['./attribute-list-statistics-menu.component.css'],
})
export class AttributeListStatisticsMenuComponent implements OnInit {

  @ViewChild(MatMenuTrigger)
  private statisticsMenu: MatMenuTrigger;

  @Input()
  public layerId: string;

  @Input()
  public statistic: AttributelistStatistic;

  public eStatisticType = StatisticType;
  public eStatisticTypeInMenu = StatisticTypeInMenu;
  public keys = Object.keys;
  public values = Object.values;
  public contextMenuPosition = { x: '0px', y: '0px' };

  constructor() { }

  public ngOnInit(): void {
  }

  public open(columnName: string, x: number, y: number) {
    this.contextMenuPosition.x = x + 'px';
    this.contextMenuPosition.y = y + 'px';
    this.statisticsMenu.menuData = { colName: columnName };
    this.statisticsMenu.menu.focusFirstItem('mouse');
    this.statisticsMenu.openMenu()
  }

  public onStatisticsMenuClick(colName: string, statisticType: StatisticType) {
    this.statistic.setStatistics(colName, statisticType, +(this.layerId), '');
  }

  public getStatisticTypeInMenu(colName: string): string {
    return this.statistic.getStatisticTypeInMenu(colName);
  }

  public getStatisticFunctionColumnType(name: string): string {
    return this.statistic.getStatisticFunctionColumnType(name);
  }

}
