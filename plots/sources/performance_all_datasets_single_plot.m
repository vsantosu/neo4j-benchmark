clear;

% create the colormap:
color1=[25 25 112]/255; % Midnight Blue
color2=[135 206 250]/255;% Light Sky Blue
babyBlue = [137 207 240]/255;
babyOrange = [240 170 137]/255;
lineColor = [3 15 21]/255;

% Reading Excel File %
filename = 'data.xlsx';
sheet = 'performance_all';

xls_totalLegends = xlsread(filename,sheet,'B2:B2','basic');
[~,xls_legends] = xlsread(filename,sheet,'B3:D3','basic');
[~,xls_tickLabel] = xlsread(filename,sheet,'B19:M19','basic');
[~,xls_yLabel] = xlsread(filename,sheet,'B5:B5','basic');
[~,xls_xLabel] = xlsread(filename,sheet,'B6:B6','basic');
[~,xls_title] = xlsread(filename,sheet,'B7:B7','basic');

% Mean values %
Trueno_Mean = xlsread(filename,sheet,'G14:R14','basic');
Neo4J_Mean = xlsread(filename,sheet,'G15:R15','basic');

% STDDEV values %
Trueno_STDDEV = xlsread(filename,sheet,'G16:R16','basic');
Neo4J_STDDEV = xlsread(filename,sheet,'G17:R17','basic');


ax=gca;
b = barwitherr([Trueno_STDDEV' Neo4J_STDDEV'], [1 2 3 4 5 6 7 8 9 10 11 12],[Trueno_Mean' Neo4J_Mean']);
b(1).EdgeColor = lineColor;
b(1).FaceColor = babyBlue;
b(2).EdgeColor = lineColor;
b(2).FaceColor = babyOrange;

set(gca, ...
    'Units','normalized',...
    'YTick',0:1000:7000,...
    'XTick',0:2:3,...
    'Position',[.15 .2 .75 .7],...
    'FontUnits','points',...
    'FontWeight','normal',...
    'FontSize',9,...
    'FontName','Times')

ylabel({'$Throughput(records/s)$'},...
        'FontUnits','points',...
        'interpreter','latex',...
        'FontSize',7,...
        'FontName','Times')
%tickLabel
set(ax, 'FontSize', 7, 'XTick',[1 2 3 4 5 6 7 8 9 10 11 12],'XTickLabel',xls_tickLabel);
ax.XTickLabelRotation = 45;

title(xls_title,...
      'FontUnits','points',...
      'interpreter','latex',...
      'FontWeight','normal',...
      'FontSize',9,...
      'FontName','Times')

%Legends
legend(xls_legends,'Location','NorthWest');
