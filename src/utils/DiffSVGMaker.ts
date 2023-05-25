/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import * as vscode from 'vscode';
import * as fs from 'fs';

const svgTemplate = (darkModeClass: string, changeTitle: string, folderB64: string, diffTag: string, function1: string, functionBody1: string, function2: string, functionbody2: string, woff: string) => `
<svg class="${darkModeClass} proposed-change-item" id="untitled" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 400 165" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><text id="untitled-s-text1" dx="0" dy="0" font-family="&quot;untitled:::Roboto&quot;" font-size="15" font-weight="700" transform="matrix(1.00106 0 0 0.902584 16.884439 22.169121)" stroke-width="0"><tspan id="untitled-s-tspan1" y="0" font-weight="700" stroke-width="0"><![CDATA[
Change 1: ${changeTitle}
]]></tspan></text><g id="untitled-s-g1" transform="matrix(.913845 0 0 0.789722 1.367181-1.256317)"><rect id="untitled-u-accept" width="89.621778" height="33.800213" rx="4" ry="4" transform="translate(17.206335 40.175205)" fill="#57a2ee" stroke-width="0"/><rect id="untitled-u-reject" width="89.621778" height="33.800213" rx="4" ry="4" transform="translate(118.606976 40.175205)" fill="#f16862" stroke-width="0"/><text id="untitled-s-text2" dx="0" dy="0" font-family="&quot;untitled:::Roboto&quot;" font-size="15" font-weight="700" transform="matrix(1.308227 0 0 1.308227 30.089181 63.043062)" fill="#fff" stroke-width="0"><tspan id="untitled-s-tspan2" y="0" font-weight="700" stroke-width="0"><![CDATA[
Accept
]]></tspan></text><text id="untitled-s-text3" dx="0" dy="0" font-family="&quot;untitled:::Roboto&quot;" font-size="15" font-weight="700" transform="matrix(1.308227 0 0 1.308227 136.447286 62.750511)" fill="#fff" stroke-width="0"><tspan id="untitled-s-tspan3" y="0" font-weight="700" stroke-width="0"><![CDATA[
Reject
]]></tspan></text></g><rect id="untitled-s-rect1" width="400" height="25.773999" rx="0" ry="0" transform="translate(0 63.163698)" fill="rgba(241,216,180,0.46)" stroke="rgba(206,188,152,0.96)"/><rect id="untitled-s-rect2" width="400" height="25.711204" rx="0" ry="0" transform="matrix(1 0 0 0.777871-.093355 105.702829)" fill="#fff" stroke="#ebebeb"/><rect id="untitled-s-rect3" width="400" height="25.773999" rx="0" ry="0" transform="matrix(1 0 0 0.650466-.093355 88.937697)" fill="#fff" stroke="#ebebeb"/><rect id="untitled-s-rect4" width="400" height="25.773999" rx="0" ry="0" transform="matrix(1 0 0 0.650466-.093354 88.937697)" fill="#f3f9ff"/><rect id="untitled-s-rect5" width="400" height="20" rx="0" ry="0" transform="matrix(.4993 0 0 1 199.999935 125.751675)" fill="#f1ffe3" stroke="#ebebeb"/><rect id="untitled-s-rect6" width="400" height="20" rx="0" ry="0" transform="matrix(.5 0 0 1-.000004 125.751675)" fill="#ffe9e9" stroke="#ebebeb"/><rect id="untitled-s-rect7" width="400" height="20" rx="0" ry="0" transform="translate(-.280066 145.751675)" fill="#fff" stroke="#ebebeb"/><image id="untitled-u-untitled-2" width="13" height="17" xlink:href="${folderB64}" preserveAspectRatio="xMidYMid meet" transform="matrix(.700232 0 0 0.700232 12.539596 70.098726)"/><rect id="untitled-s-rect8" width="41.658645" height="94.087107" rx="0" ry="0" transform="matrix(1 0 0 0.816414 199.906646 88.9377)" fill="rgba(247,248,252,0.01)" stroke="#ebebeb"/><rect id="untitled-s-rect9" width="41.658645" height="94.087107" rx="0" ry="0" transform="matrix(1 0 0 0.816413-.280067 88.937702)" fill="rgba(247,248,252,0)" stroke="#ebebeb"/><text id="untitled-u-difftag" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(46.712201 101.021443)" fill="rgba(0,0,0,0.41)" stroke-width="0"><tspan id="untitled-s-tspan4" y="0" font-weight="400" stroke-width="0"><![CDATA[
${diffTag}
]]></tspan></text><text id="untitled-s-text4" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(47.644074 139.11186)" fill="rgba(0,0,0,0.41)" stroke-width="0"><tspan id="untitled-s-tspan5" y="0" font-weight="400" stroke-width="0"><![CDATA[
-
]]></tspan></text><text id="untitled-s-text5" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(247.773361 138.794576)" fill="rgba(0,0,0,0.41)" stroke-width="0"><tspan id="untitled-s-tspan6" y="0" font-weight="400" stroke-width="0"><![CDATA[
+
]]></tspan></text><text id="untitled-s-text6" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(25.998595 118.745731)" fill="rgba(0,0,0,0.41)" stroke-width="0"><tspan id="untitled-s-tspan7" y="0" font-weight="400" stroke-width="0"><![CDATA[
1
]]></tspan></text><text id="untitled-s-text7" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(26.168941 138.794576)" fill="rgba(0,0,0,0.41)" stroke-width="0"><tspan id="untitled-s-tspan8" y="0" font-weight="400" stroke-width="0"><![CDATA[
2
]]></tspan></text><text id="untitled-s-text8" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(26.168941 158.794577)" fill="rgba(0,0,0,0.41)" stroke-width="0"><tspan id="untitled-s-tspan9" y="0" font-weight="400" stroke-width="0"><![CDATA[
3
]]></tspan></text><text id="untitled-s-text9" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(228.053812 159.518863)" fill="rgba(0,0,0,0.41)" stroke-width="0"><tspan id="untitled-s-tspan10" y="0" font-weight="400" stroke-width="0"><![CDATA[
3
]]></tspan></text><text id="untitled-s-text10" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(228.053812 139.518862)" fill="rgba(0,0,0,0.41)" stroke-width="0"><tspan id="untitled-s-tspan11" y="0" font-weight="400" stroke-width="0"><![CDATA[
2
]]></tspan></text><text id="untitled-s-text11" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(227.883465 119.470018)" fill="rgba(0,0,0,0.41)" stroke-width="0"><tspan id="untitled-s-tspan12" y="0" font-weight="400" stroke-width="0"><![CDATA[
1
]]></tspan></text><text id="untitled-u-function1" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="10" font-weight="400" transform="translate(58.211657 121.174324)" stroke-width="0"><tspan id="untitled-s-tspan13" y="0" font-weight="400" stroke-width="0"><![CDATA[
${function1}
]]></tspan></text><text id="untitled-u-functionbody1" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="10" font-weight="400" transform="translate(58.211657 138.196404)" stroke-width="0"><tspan id="untitled-s-tspan14" y="0" font-weight="400" stroke-width="0"><![CDATA[
${functionBody1}
]]></tspan><tspan id="untitled-s-tspan15" x="0" y="10" font-weight="400" stroke-width="0"><![CDATA[
 
]]></tspan></text><text id="untitled-s-text12" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="10" font-weight="400" transform="translate(58.041311 156.710032)" stroke-width="0"><tspan id="untitled-s-tspan16" y="0" font-weight="400" stroke-width="0"><![CDATA[
}
]]></tspan></text><text id="untitled-s-text13" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="10" font-weight="400" transform="translate(259.616212 156.71008)" stroke-width="0"><tspan id="untitled-s-tspan17" y="0" font-weight="400" stroke-width="0"><![CDATA[
}
]]></tspan></text><text id="untitled-u-functionbody2" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="10" font-weight="400" transform="translate(259.786558 138.196453)" stroke-width="0"><tspan id="untitled-s-tspan18" y="0" font-weight="400" stroke-width="0"><![CDATA[
${functionbody2}
]]></tspan><tspan id="untitled-s-tspan19" x="0" y="20" font-weight="400" stroke-width="0"><![CDATA[
 
]]></tspan></text><text id="untitled-u-function2" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="10" font-weight="400" transform="translate(259.786558 121.174373)" stroke-width="0"><tspan id="untitled-s-tspan20" y="0" font-weight="400" stroke-width="0"><![CDATA[
${function2}
]]></tspan></text><text id="untitled-u-difffile" dx="0" dy="0" font-family="&quot;untitled:::Courier Prime&quot;" font-size="14" font-weight="400" transform="translate(37.211847 79.0936)" stroke-width="0"><tspan id="untitled-s-tspan21" y="0" font-weight="400" stroke-width="0"><![CDATA[
file.txt
]]></tspan></text>
<style>
.dark-mode #untitled-s-text1,
.dark-mode #untitled-u-difftag,
.dark-mode #untitled-u-function1,
.dark-mode #untitled-u-functionbody1,
.dark-mode #untitled-s-text12,
.dark-mode #untitled-u-difffile {
  fill: #fff; /* Change text color to white for dark mode */
}
<![CDATA[${woff}]]>
</style></svg>`;

export default class DiffSVGMaker {

    constructor(public extensionUri: any, public diff: any, public options: any) {
    }

    truncateText(text: string, maxLength: number) {
        if(!text) { return ''; }
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + "...";
        }
        return text;
    }

    createSvgDataUri(svg: any) {
        // Encode the SVG as base64.
        const base64Svg = btoa(svg);
        // Combine the encoded SVG with the URL data header.
        return `data:image/svg+xml;base64,${base64Svg}`;
    }

    createSVG() {
        const changeTitle = this.truncateText(this.diff.newFileName, 40);
        const diffTag = this.truncateText(this.diff.changes[0], 40);
        const function1 = this.truncateText(this.diff.changes[1], 40);
        const functionBody1 = this.truncateText(this.diff.changes[2], 40);
        const function2 = this.truncateText(this.diff.changes[1], 40);
        const functionBody2 = this.truncateText(this.diff.changes[2], 40);
        const closingBrace = "}";
        const fileName = this.truncateText(this.diff.oldFileName, 40);

        const darkModeClass = this.options.darkMode ? 'dark-mode' : '';
        const folderB64 = this._loadContent(this.extensionUri, 'resources/icons/folderB64.base64');
        const woff = this._loadContent(this.extensionUri, 'resources/fonts/courierPrime.woff');
        const template = svgTemplate(darkModeClass, changeTitle, folderB64, diffTag, function1, functionBody1, function2, functionBody2, woff);
        
        // Replace placeholders with actual data in the template
        const svgString = template
        .replace("${changeTitle}", changeTitle)
        .replace("${diffTag}", diffTag)
        .replace("${function1}", function1)
        .replace("${functionBody1}", functionBody1)
        .replace("${closingBrace}", closingBrace)
        .replace("${fileName}", fileName);
        return this.createSvgDataUri(svgString);
    }

    private _loadContent(extensionUri: vscode.Uri, libName: string) {
        const libPath = vscode.Uri.joinPath(extensionUri, libName);
        const libContent = fs.readFileSync(libPath.fsPath, 'utf8');
        return libContent;
    }
    
}
