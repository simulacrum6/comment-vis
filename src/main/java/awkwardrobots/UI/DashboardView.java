package awkwardrobots.UI;

import awkwardrobots.data.Comment;
import awkwardrobots.data.CommentList;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.BeforeEnterEvent;
import com.vaadin.flow.router.BeforeEnterObserver;
import com.vaadin.flow.router.Route;

@Route
public class DashboardView extends VerticalLayout implements BeforeEnterObserver {

    private Grid<Comment> commentGrid;

    public DashboardView() {
        setSizeFull();
        commentGrid = new Grid<>();
        commentGrid.addColumn(Comment::getText).setHeader("Comment");
        commentGrid.addColumn(Comment::getSentiment).setHeader("Sentiment");
        commentGrid.setSizeFull();
        add(commentGrid);
    }

    @Override
    public void beforeEnter(BeforeEnterEvent beforeEnterEvent) {
        CommentList comments = UI.getCurrent().getSession().getAttribute(CommentList.class);
        if (comments == null || comments.isEmpty()) {
            beforeEnterEvent.rerouteTo(UploadView.class);
        } else {
            commentGrid.setItems(comments);
        }
    }
}
