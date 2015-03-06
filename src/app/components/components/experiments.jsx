/*
if ((shouldShowTrace && shouldNodeBeVisible.bind(self)(node)) || isWhitespace) {
  if (displayString === "format") {
    formatPExprCount++;
  }
  // label
  var labelClasses = cx({
    'label': true,
    'prim': node.expr.isPrimitive(),
  });
  var labelProps = {
    onMouseEnter: self.onMouseOverPExpr.bind(self, node),
    onMouseLeave: self.onMouseOutPExpr,
    onClick: self.onClickPExpr.bind(self, node),
  };
  var displayString = node.displayString;
  if (displayString === "/[\\s]/") {
    displayString = ' ';
  }
  var label = <div key={"label#"+formatPExprCount} className={labelClasses} {...labelProps}>{displayString}</div>;

  /*
  var label = <div key={"label#"+formatPExprCount} className={labelClasses} {...labelProps}>
                <div className="labelContent">{displayString}</div>
              </div>;
  */
  // children
  var children =
    <div key={"children#"+formatPExprCount} className="children">
      {(displayString === "format") ? <ReactCSSTransitionGroup className="childrenCSSTransitionGroup" transitionName="example">
                                        {childNodes}
                                      </ReactCSSTransitionGroup>
                                    : {childNodes}}
    </div>;

  // pexpr
  var pexprClasses = cx({
    'pexpr': true,
    'whitespace': isWhitespace,
  });
  var pexprProps = {
    node: node,
  };
  return <div key={"formatPExpr#"+formatPExprCount+"type:"+displayString} className={pexprClasses} {...pexprProps}>
          {label}{children}
        </div>;
  // return <div className={pexprClasses} {...pexprProps}>{label}{children}</div>;
} else {
  return childNodes;
}


*/
