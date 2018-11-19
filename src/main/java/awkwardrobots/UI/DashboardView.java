package awkwardrobots.UI;

import awkwardrobots.analysis.SimpleAspectExtractor;
import awkwardrobots.data.Aspect;
import awkwardrobots.data.CommentList;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.BeforeEnterEvent;
import com.vaadin.flow.router.BeforeEnterObserver;
import com.vaadin.flow.router.Route;
import org.apache.uima.UIMAException;

@Route
public class DashboardView extends VerticalLayout implements BeforeEnterObserver {

    private Grid<Aspect> aspectGrid;

    public DashboardView() {
        setSizeFull();

        Button backToUpload = new Button("Back to Upload");
        backToUpload.addClickListener(click -> UI.getCurrent().navigate(UploadView.class));
        add(backToUpload);

        aspectGrid = new Grid<>(Aspect.class);
        aspectGrid.setColumns("mentions", "name", "positiveAttributes", "negativeAttributes");
        aspectGrid.setSizeFull();
        aspectGrid.getColumns().forEach(column -> column.setResizable(true));
        add(aspectGrid);
    }

    @Override
    public void beforeEnter(BeforeEnterEvent beforeEnterEvent) {
        CommentList comments = UI.getCurrent().getSession().getAttribute(CommentList.class);
        if (comments == null || comments.isEmpty()) {
            beforeEnterEvent.rerouteTo(UploadView.class);
        } else {
            try {
                aspectGrid.setItems(new SimpleAspectExtractor().extract(comments));
            } catch (UIMAException e) {
                e.printStackTrace();
            }
        }
    }
}
