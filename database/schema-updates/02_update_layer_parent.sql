update layer l set parent =
  (select layer from layer_children lc where lc.child = l.id)
