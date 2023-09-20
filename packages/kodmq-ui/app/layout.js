"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
var ThemeProvider_1 = require("@/components/layout/ThemeProvider");
require("./globals.css");
var TopBar_1 = require("@/components/layout/TopBar");
exports.metadata = {
    title: "KodMQ UI",
    description: "Control panel for KodMQ",
};
function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="en">
      <body className="font-sans antialiased">
        <ThemeProvider_1.ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <div className="bg-background text-foreground">
            <TopBar_1.default />

            <div className="container mx-auto pt-4 sm:pt-6">
              {children}
            </div>
          </div>
        </ThemeProvider_1.ThemeProvider>
      </body>
    </html>);
}
exports.default = RootLayout;
