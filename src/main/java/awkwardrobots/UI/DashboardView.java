package awkwardrobots.UI;

import awkwardrobots.data.Comment;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener;
import com.vaadin.ui.Grid;
import com.vaadin.ui.VerticalLayout;

import java.util.List;

public class DashboardView extends VerticalLayout implements View {

    private List<Comment> comments;
    private Grid<Comment> commentGrid;

    public DashboardView() {
        setSizeFull();
        commentGrid = new Grid<>();
        commentGrid.addColumn(Comment::getText).setCaption("Text");
        commentGrid.addColumn(Comment::getSentiment).setCaption("Sentiment");
        commentGrid.setSizeFull();
        addComponent(commentGrid);
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    @Override
    public void enter(ViewChangeListener.ViewChangeEvent event) {
        if (comments == null || comments.isEmpty()) {
            getUI().getNavigator().navigateTo("Upload");
        } else {
            commentGrid.setItems(comments);
        }
    }
}
