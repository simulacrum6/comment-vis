package awkwardrobots.UI;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.VerticalLayout;

public class DashboardView extends VerticalLayout implements View {

    public DashboardView() {
        setWidth("500px");
        Button navigateToUpload = new Button("Go to Upload",
                click -> getUI().getNavigator().navigateTo("Upload"));
        addComponent(navigateToUpload);
        setComponentAlignment(navigateToUpload, Alignment.MIDDLE_CENTER);
    }

    @Override
    public void enter(ViewChangeListener.ViewChangeEvent event) {
    }
}
