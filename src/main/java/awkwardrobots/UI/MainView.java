package awkwardrobots.UI;

import awkwardrobots.data.CommentList;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.router.BeforeEnterEvent;
import com.vaadin.flow.router.BeforeEnterObserver;
import com.vaadin.flow.router.Route;

@Route
public class MainView extends Div implements BeforeEnterObserver {
    @Override
    public void beforeEnter(BeforeEnterEvent beforeEnterEvent) {
        if (UI.getCurrent().getSession().getAttribute(CommentList.class) == null) {
            beforeEnterEvent.rerouteTo(UploadView.class);
        } else {
            beforeEnterEvent.rerouteTo(DashboardView.class);
        }
    }
}
