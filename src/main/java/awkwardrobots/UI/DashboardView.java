package awkwardrobots.UI;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener;
import com.vaadin.ui.Button;
import com.vaadin.ui.VerticalLayout;

public class DashboardView extends VerticalLayout implements View {

    public DashboardView() {
        addComponent(new Button("Go to Upload",
                click -> getUI().getNavigator().navigateTo("Upload")));
    }

    @Override
    public void enter(ViewChangeListener.ViewChangeEvent event) {
    }
}
